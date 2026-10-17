import { SHOP_INFO } from '../constants';
import type { CartItem, Product } from '../types';
import { formatRupees, isPricedProduct } from './pricing';

/** Public link to a product page, used in WhatsApp messages. */
export const productUrl = (productId: string): string =>
  `${window.location.origin}/product/${encodeURIComponent(productId)}`;

export const whatsappUrl = (message: string): string =>
  `https://wa.me/${SHOP_INFO.whatsapp}?text=${encodeURIComponent(message)}`;

export const openWhatsApp = (message: string): void => {
  window.open(whatsappUrl(message), '_blank', 'noopener');
};

export const productInquiryMessage = (product: Pick<Product, 'id' | 'name'>): string =>
  `Hi Sanghavi Gold, I'm interested in *${product.name}*.\nLink: ${productUrl(product.id)}\n\nCould you share the price and details?`;

export type ItemsAction = 'inquiry' | 'video';

type MessageItem = Pick<CartItem, 'id' | 'name' | 'price' | 'priceOnRequest' | 'cardDisplayMode' | 'weight' | 'purity'> & {
  quantity?: number;
};

/** One message listing several items (from the bag or wishlist), with live prices where known. */
export const itemsMessage = (items: MessageItem[], action: ItemsAction, source: 'bag' | 'wishlist'): string => {
  const intro = action === 'video' ? 'request a VIDEO CALL' : 'ask about';
  let message = `Hi Sanghavi Gold, I would like to ${intro} these items from my ${source}:\n\n`;

  items.forEach((item, index) => {
    message += `${index + 1}. *${item.name}*\n`;
    if (item.quantity) message += `   Qty: ${item.quantity}\n`;
    message += `   Price: ${isPricedProduct(item) ? formatRupees(item.price) : 'On request'}\n`;
    if (item.weight) message += `   Weight: ${item.weight}\n`;
    if (item.purity) message += `   Purity: ${item.purity}\n`;
    message += `   Link: ${productUrl(item.id)}\n\n`;
  });

  const total = items
    .filter(isPricedProduct)
    .reduce((sum, item) => sum + item.price * (item.quantity ?? 1), 0);
  if (total > 0) message += `Total of priced items: ${formatRupees(total)}\n\n`;

  message +=
    action === 'video'
      ? 'Please let me know when we can connect for a live viewing.'
      : 'Can you please confirm availability?';
  return message;
};
