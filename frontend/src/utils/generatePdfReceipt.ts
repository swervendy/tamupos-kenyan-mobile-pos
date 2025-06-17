import jsPDF from 'jspdf';
import { Order } from '../types';

// Constants for receipt layout
const Y_START = 8; // Slightly less top margin
const LINE_HEIGHT = 4.5;
const SMALL_LINE_HEIGHT = 3.5;
const LEFT_MARGIN = 7;
const PAGE_WIDTH = 70; // Further reduced width for typical receipt feel
const CONTENT_WIDTH = PAGE_WIDTH - (LEFT_MARGIN * 2);
const RIGHT_TEXT_X = PAGE_WIDTH - LEFT_MARGIN;

interface RestaurantPdfDetails {
  name: string;
  address: string;
  phone: string;
  kraPin: string;
  mpesaPaybill: string;
}

export const downloadOrderPdf = (order: Order, details: RestaurantPdfDetails): void => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [PAGE_WIDTH, 297]
  });
  let currentY = Y_START;

  const addCenteredText = (text: string, y: number, size: number, weight: 'normal' | 'bold' = 'normal') => {
    doc.setFontSize(size);
    doc.setFont('helvetica', weight);
    const textWidth = doc.getStringUnitWidth(text) * size / doc.internal.scaleFactor;
    const xPosition = (PAGE_WIDTH - textWidth) / 2;
    // Handle multi-line centered text if text is too long
    const splitText = doc.splitTextToSize(text, CONTENT_WIDTH - 2); // -2 for a little padding
    doc.text(splitText, xPosition < LEFT_MARGIN ? LEFT_MARGIN : xPosition, y, { align: splitText.length > 1 ? 'left' : 'center' });
    currentY += (splitText.length * size * 0.4);
  };

  const addLeftRightText = (leftText: string, rightText: string, y: number, size: number, weightLeft: 'normal' | 'bold' = 'normal', weightRight: 'normal' | 'bold' = 'normal') => {
    doc.setFontSize(size);
    doc.setFont('helvetica', weightLeft);
    doc.text(leftText, LEFT_MARGIN, y);
    doc.setFont('helvetica', weightRight);
    doc.text(rightText, RIGHT_TEXT_X, y, { align: 'right' });
    currentY += size * 0.4;
  };
  
  const addDashedLine = (y: number) => {
    const DOTTED_LINE_CHAR = '- ';
    const numDots = Math.floor(CONTENT_WIDTH / (doc.getStringUnitWidth(DOTTED_LINE_CHAR.trim()) * 6 / doc.internal.scaleFactor)); // Approx
    doc.setFontSize(6);
    doc.text(DOTTED_LINE_CHAR.repeat(numDots), LEFT_MARGIN, y);
    currentY += SMALL_LINE_HEIGHT * 0.7;
  };

  // ---- Header ----
  addCenteredText(details.name, currentY, 11, 'bold');
  // Split address if too long
  const addressLines = doc.splitTextToSize(details.address, CONTENT_WIDTH);
  addressLines.forEach((line: string) => addCenteredText(line, currentY, 6));
  if (details.phone) addCenteredText(`Tel: ${details.phone}`, currentY, 6);
  if (details.kraPin) addCenteredText(`PIN: ${details.kraPin}`, currentY, 6);
  currentY += LINE_HEIGHT * 0.3;

  // ---- Order Info ----
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-GB'); // DD/MM/YYYY
  const orderTime = new Date(order.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }); // HH:MM AM/PM
  addLeftRightText(`Date: ${orderDate}`, `Time: ${orderTime}`, currentY, 6);
  if (order.tableNumber) {
    addLeftRightText(`Table: ${order.tableNumber}`, '', currentY, 6);
  }
  if (order.customerName) {
    addLeftRightText(`Guest: ${order.customerName}`, '', currentY, 6);
  }
  // Add a placeholder for server name if available in future
  addLeftRightText(`Receipt: ${order.id.substring(0, 8)}`, 'Server: Alex', currentY, 6);
  currentY += LINE_HEIGHT * 0.3;
  addDashedLine(currentY);
  
  // ---- Items List ----
  order.cart.forEach(item => {
    const itemName = item.foodItem.name;
    const itemQty = item.quantity.toString();
    const itemPrice = item.foodItem.price; // Unit price
    const itemTotal = (itemPrice * item.quantity).toFixed(2);
    
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    // Display Qty x Item Name (potentially split if too long)
    const itemNameToSplit = `${itemQty} x ${itemName}`;
    const splitItemName = doc.splitTextToSize(itemNameToSplit, CONTENT_WIDTH - 15); // Allow space for price
    
    for (let i = 0; i < splitItemName.length; i++) {
      if (i === 0) { // First line with price
        addLeftRightText(splitItemName[i], itemTotal, currentY, 7);
      } else { // Subsequent lines for long item names
        doc.text(splitItemName[i], LEFT_MARGIN, currentY);
        currentY += LINE_HEIGHT * 0.9;
      }
    }

    if (item.notes) {
      doc.setFontSize(5.5);
      const noteLines = doc.splitTextToSize(`  (${item.notes})`, CONTENT_WIDTH - 4);
      noteLines.forEach((line: string) => {
        doc.text(line, LEFT_MARGIN + 2, currentY);
        currentY += SMALL_LINE_HEIGHT * 0.9;
      });
    }
  });
  addDashedLine(currentY);

  // ---- Totals ----
  doc.setFontSize(7.5);
  addLeftRightText('Subtotal', `${order.subtotalAmount.toFixed(2)}`, currentY, 7.5, 'normal', 'normal');
  addLeftRightText('VAT (16%)', `${order.vatAmount.toFixed(2)}`, currentY, 7.5, 'normal', 'normal');
  addLeftRightText('Catering Levy (2%)', `${order.cateringLevyAmount.toFixed(2)}`, currentY, 7.5, 'normal', 'normal');
  currentY += SMALL_LINE_HEIGHT * 0.3;
  addDashedLine(currentY); // Add a dashed line after VAT
  currentY += SMALL_LINE_HEIGHT * 0.3; // Add some space before the total
  doc.setFontSize(9);
  addLeftRightText('TOTAL', `${order.totalAmount.toFixed(2)} KES`, currentY, 9, 'bold', 'bold');
  currentY += LINE_HEIGHT * 1.2;

  // ---- Footer ----
  addCenteredText('Thank You! Come Again!', currentY, 7.5, 'bold');
  currentY += SMALL_LINE_HEIGHT * 0.8;
  if (details.mpesaPaybill) {
    addCenteredText(`MPESA Paybill: ${details.mpesaPaybill}`, currentY, 6.5);
    // You can add Account Number instructions if needed, e.g.:
    // addCenteredText('Account No: TABLE_NO or YOUR_NAME', currentY, 6);
  }
  currentY += LINE_HEIGHT * 0.8;
  addCenteredText('Powered by TamuPOS 😋', currentY, 5.5);

  doc.save(`TamuPOS_Receipt_${order.id.substring(0, 8)}.pdf`);
}; 