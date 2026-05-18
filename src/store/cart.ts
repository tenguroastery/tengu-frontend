import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '../types';

export type CartItem = {
  key: string;
  productSlug: string;
  productName: string;
  productImage: string | null;
  sizeG: number;
  unitPriceClp: number;
  quantity: number;
};

export type CartReconcileReport = {
  removed: string[];   // nombres de productos sacados (despublicados / variante eliminada)
  priceUpdated: string[]; // nombres con precio actualizado
};

type CartState = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'key' | 'quantity'>, quantity?: number) => void;
  removeItem: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  clear: () => void;
  /** Reconcilia el cart contra la lista fresca del backend. Saca items
   * huérfanos (producto despublicado o variante eliminada) y actualiza
   * precios, nombres e imágenes. Devuelve un reporte de qué cambió. */
  reconcile: (freshProducts: Product[]) => CartReconcileReport;
};

const itemKey = (slug: string, sizeG: number) => `${slug}::${sizeG}`;

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item, quantity = 1) =>
        set((state) => {
          const key = itemKey(item.productSlug, item.sizeG);
          const existing = state.items.find((i) => i.key === key);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.key === key ? { ...i, quantity: i.quantity + quantity } : i,
              ),
            };
          }
          return { items: [...state.items, { ...item, key, quantity }] };
        }),
      removeItem: (key) => set((state) => ({ items: state.items.filter((i) => i.key !== key) })),
      setQuantity: (key, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.key !== key)
              : state.items.map((i) => (i.key === key ? { ...i, quantity } : i)),
        })),
      clear: () => set({ items: [] }),
      reconcile: (freshProducts) => {
        const report: CartReconcileReport = { removed: [], priceUpdated: [] };
        const bySlug = new Map(freshProducts.map((p) => [p.slug, p]));
        let newItems: CartItem[] = [];
        // Captura el state actual sin que la callback de set lo vea como diff trivial.
        const current = useCart.getState().items;
        for (const item of current) {
          const product = bySlug.get(item.productSlug);
          const variant = product?.variants.find((v) => v.size_g === item.sizeG);
          if (!product || !variant) {
            report.removed.push(item.productName);
            continue;
          }
          // Imagen del producto puede haber cambiado de filename (timestamp).
          // Guardamos solo el filename; el render prepende /uploads/.
          const freshImage = product.image ?? null;
          if (variant.price_clp !== item.unitPriceClp || product.name !== item.productName || freshImage !== item.productImage) {
            if (variant.price_clp !== item.unitPriceClp) {
              report.priceUpdated.push(product.name);
            }
            newItems.push({
              ...item,
              productName: product.name,
              productImage: freshImage,
              unitPriceClp: variant.price_clp,
            });
          } else {
            newItems.push(item);
          }
        }
        set({ items: newItems });
        return report;
      },
    }),
    { name: 'tengu-cart-v1' },
  ),
);

export const selectCartCount = (state: CartState) =>
  state.items.reduce((sum, i) => sum + i.quantity, 0);

export const selectCartSubtotal = (state: CartState) =>
  state.items.reduce((sum, i) => sum + i.unitPriceClp * i.quantity, 0);
