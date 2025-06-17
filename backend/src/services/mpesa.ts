import axios from 'axios';

export interface STKPushRequest {
  phoneNumber: string;
  amount: number;
  orderId: string;
  accountReference: string;
}

export interface STKPushResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

export interface MpesaConfig {
  consumerKey: string;
  consumerSecret: string;
  passkey: string;
  shortcode: string;
  callbackUrl: string;
  baseUrl: string;
}

class MPesaService {
  private config: MpesaConfig;

  constructor(config: MpesaConfig) {
    this.config = config;
    
    if (!config.consumerKey || !config.consumerSecret || !config.passkey || !config.shortcode || !config.callbackUrl) {
      // Log the specific missing key for easier debugging.
      const missing = Object.entries(config).filter(([key, value]) => !value).map(([key]) => key);
      console.error(`❌ M-Pesa Service cannot be initialized. Missing required config values: ${missing.join(', ')}`);
      // In a real app, you might want a more robust error handling strategy than just logging.
      throw new Error(`M-Pesa Service is missing required configuration: ${missing.join(', ')}`);
    }

    // Debug logging
    console.log('🔐 M-Pesa Service Initialized for Shortcode:', this.config.shortcode);
  }

  private async getAccessToken(): Promise<string> {
    const auth = Buffer.from(`${this.config.consumerKey}:${this.config.consumerSecret}`).toString('base64');
    
    try {
      const response = await axios.get(
        `${this.config.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
        {
          headers: {
            Authorization: `Basic ${auth}`,
          },
        }
      );
      
      console.log('✅ Access token obtained successfully for shortcode:', this.config.shortcode);
      return response.data.access_token;
    } catch (error: any) {
      console.error(`❌ Error getting M-Pesa access token for shortcode ${this.config.shortcode}:`, {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });
      throw new Error(`Failed to get M-Pesa access token for shortcode ${this.config.shortcode}`);
    }
  }

  private generatePassword(): string {
    const timestamp = this.getTimestamp();
    const password = Buffer.from(`${this.config.shortcode}${this.config.passkey}${timestamp}`).toString('base64');
    return password;
  }

  private getTimestamp(): string {
    return new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
  }

  private formatPhoneNumber(phoneNumber: string): string {
    // Remove any non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // Handle different formats
    if (cleaned.startsWith('0')) {
      cleaned = '254' + cleaned.slice(1);
    } else if (cleaned.startsWith('+254')) {
      cleaned = cleaned.slice(1);
    } else if (cleaned.startsWith('254')) {
      // Already in correct format
    } else if (cleaned.length === 9) {
      cleaned = '254' + cleaned;
    }
    
    return cleaned;
  }

  async initiateSTKPush(request: STKPushRequest): Promise<STKPushResponse> {
    try {
      const accessToken = await this.getAccessToken();
      const timestamp = this.getTimestamp();
      const password = this.generatePassword();
      const formattedPhone = this.formatPhoneNumber(request.phoneNumber);

      console.log('💰 M-Pesa STK Push - Amount received:', request.amount, typeof request.amount);
      console.log('📞 M-Pesa STK Push - Phone formatted:', formattedPhone);

      const stkPushData = {
        BusinessShortCode: this.config.shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: request.amount,
        PartyA: formattedPhone,
        PartyB: this.config.shortcode,
        PhoneNumber: formattedPhone,
        CallBackURL: this.config.callbackUrl,
        AccountReference: request.accountReference,
        TransactionDesc: `Payment for Order ${request.orderId}`,
      };

      console.log('📤 M-Pesa STK Push payload:', JSON.stringify(stkPushData, null, 2));

      const response = await axios.post(
        `${this.config.baseUrl}/mpesa/stkpush/v1/processrequest`,
        stkPushData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('📥 M-Pesa STK Push success response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('STK Push error:', error.response?.data || error.message);
      throw new Error('Failed to initiate STK Push');
    }
  }

  async querySTKPushStatus(checkoutRequestId: string): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();
      const timestamp = this.getTimestamp();
      const password = this.generatePassword();

      const queryData = {
        BusinessShortCode: this.config.shortcode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId,
      };

      const response = await axios.post(
        `${this.config.baseUrl}/mpesa/stkpushquery/v1/query`,
        queryData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // If the query itself is successful, response.data contains the transaction status
      // (e.g., ResultCode '0' for success, '1032' for cancelled by user)
      return response.data;
    } catch (error: any) {
      const mpesaError = error.response?.data;

      if (mpesaError && mpesaError.requestId && mpesaError.errorCode && mpesaError.errorMessage) {
        // This is a structured error from the M-Pesa Query API itself
        
        if (mpesaError.errorCode === '500.001.1001') { // "The transaction is being processed"
          console.warn(`M-Pesa query for ${checkoutRequestId} reports transaction still processing by M-Pesa: ${mpesaError.errorMessage}`);
          // This means the query API is telling us to wait, user action pending or M-Pesa processing.
          // Return a structure that the frontend will interpret as "continue polling".
          return {
            ResponseCode: "0", // Indicates the query *to M-Pesa's API* was syntactically okay.
            ResponseDescription: "Query successful, M-Pesa reports transaction is still being processed.",
            MerchantRequestID: mpesaError.requestId, // Use M-Pesa's requestId from the error
            CheckoutRequestID: checkoutRequestId,
            ResultCode: "USER_ACTION_PENDING", // Custom code for frontend
            ResultDesc: mpesaError.errorMessage // "The transaction is being processed"
          };
        } else {
          // Other errors from M-Pesa Query API (e.g., invalid CheckoutRequestID format, auth issues for query)
          console.error(`M-Pesa STK Push Query API error for ${checkoutRequestId}:`, mpesaError);
          return {
            ResponseCode: "1", // Indicates the query *to M-Pesa's API* itself failed.
            ResponseDescription: `M-Pesa Query API Error: ${mpesaError.errorMessage}`,
            MerchantRequestID: mpesaError.requestId,
            CheckoutRequestID: checkoutRequestId,
            ResultCode: "QUERY_FAILED", // Custom code for frontend
            ResultDesc: mpesaError.errorMessage,
            mpesaErrorCodeFromQuery: mpesaError.errorCode, // Pass through M-Pesa's specific error
            mpesaErrorMessageFromQuery: mpesaError.errorMessage
          };
        }
      }
      
      // If it's not a structured M-Pesa API error, it might be a network error or other unexpected issue.
      console.error(`Network or unexpected error during STK Push query for ${checkoutRequestId}:`, error.message);
      throw new Error('Failed to query STK Push status due to network or unexpected error');
    }
  }
}

export default MPesaService; 