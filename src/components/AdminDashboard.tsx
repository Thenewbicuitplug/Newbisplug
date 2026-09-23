import React, { useEffect, useState } from 'react';
import {
  X,
  Package,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Plus,
  Save,
} from 'lucide-react';
import { Product } from '../types';
import {
  addProductData,
  updateProductData,
  getBackendSupabaseStatus,
} from '../lib/supabase';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onRefreshProducts: () => Promise<void> | void;
}

export function AdminDashboard({
  isOpen,
  onClose,
  products,
  onRefreshProducts,
}: AdminDashboardProps) {
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [connected, setConnected] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddProduct, setShowAddProduct] = useState(false);

  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    id: '',
    name: '',
    tagline: '',
    description: '',
    price: 0,
    image: '',
    category: 'house-cookies',
    dietary: ['Halal'],
    inStock: true,
    stockCount: 20,
    rating: 4.9,
    reviewCount: 0,
  });

  useEffect(() => {
    if (isOpen) {
      checkConnection();
    }
  }, [isOpen]);

  const checkConnection = async () => {
    try {
      const status = await getBackendSupabaseStatus();
      setConnected(Boolean(status.connected));
    } catch {
      setConnected(false);
    }
  };

  const refreshProducts = async () => {
    setRefreshing(true);
    setError('');
    setMessage('');

    try {
      await onRefreshProducts();
      await checkConnection();
      setMessage('Products refreshed successfully.');
    } catch (err: any) {
      setError(err?.message || 'Could not refresh products.');
    } finally {
      setRefreshing(false);
    }
  };

  const saveProduct = async () => {
    if (!editingProduct) return;

    setSaving(true);
    setError('');
    setMessage('');

    try {
      const result = await updateProductData(
        editingProduct.id,
        editingProduct
      );

      if (!result) {
        throw new Error('The product could not be saved.');
      }

      setMessage(`${editingProduct.name} saved successfully.`);
      setEditingProduct(null);

      await onRefreshProducts();
    } catch (err: any) {
      setError(err?.message || 'Could not save product.');
    } finally {
      setSaving(false);
    }
  };

  const createProduct = async () => {
    if (!newProduct.id || !newProduct.name) {
      setError('Please enter a product ID and product name.');
      return;
    }

    setSaving(true);
    setError('');
    setMessage('');

    try {
      const product: Product = {
        id: String(newProduct.id),
        name: String(newProduct.name),
        tagline: String(newProduct.tagline || ''),
        description: String(newProduct.description || ''),
        price: Number(newProduct.price || 0),

        originalPrice: newProduct.originalPrice
          ? Number(newProduct.originalPrice)
          : undefined,

        image: String(newProduct.image || ''),

        category: newProduct.category as Product['category'],

        dietary: Array.isArray(newProduct.dietary)
          ? newProduct.dietary
          : ['Halal'],

        memeBadge: newProduct.memeBadge,
        badgeColor: newProduct.badgeColor,

        inStock: newProduct.inStock !== false,

        stockCount: Number(newProduct.stockCount || 0),

        weightGrams: newProduct.weightGrams
          ? Number(newProduct.weightGrams)
          : undefined,

        isCustomizable: Boolean(newProduct.isCustomizable),

        customPlaceholder: newProduct.customPlaceholder,

        rating: Number(newProduct.rating || 4.9),

        reviewCount: Number(newProduct.reviewCount || 0),

        ingredientsSnippet: newProduct.ingredientsSnippet,
      };

      const result = await addProductData(product);

      if (!result) {
        throw new Error('The product could not be created.');
      }

      setMessage(`${product.name} added successfully.`);
      setShowAddProduct(false);

      setNewProduct({
        id: '',
        name: '',
        tagline: '',
        description: '',
        price: 0,
        image: '',
        category: 'house-cookies',
        dietary: ['Halal'],
        inStock: true,
        stockCount: 20,
        rating: 4.9,
        reviewCount: 0,
      });

      await onRefreshProducts();
    } catch (err: any) {
      setError(err?.message || 'Could not add product.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-full p-3 sm:p-6 flex items-start justify-center">
        <div className="w-full max-w-5xl bg-[#FFF8F9] rounded-3xl shadow-2xl overflow-hidden">

          {/* HEADER */}
          <div className="bg-stone-900 text-white px-5 py-4 flex items-center justify-between sticky top-0 z-10">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-pink-400">
                Secret Baker Area
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold">
                Admin Dashboard 🍪
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
              aria-label="Close dashboard"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* CONNECTION STATUS */}
          <div className="px-5 pt-5">
            <div
              className={`rounded-2xl border p-4 ${
                connected
                  ? 'bg-green-50 border-green-200'
                  : 'bg-amber-50 border-amber-200'
              }`}
            >
              <div className="flex items-center gap-3">
                {connected ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                )}

                <div>
                  <p className="font-bold text-sm text-stone-800">
                    {connected
                      ? 'Supabase Connected'
                      : 'Supabase Connection Not Verified'}
                  </p>

                  <p className="text-xs text-stone-500">
                    {connected
                      ? 'Your admin dashboard can communicate with the database.'
                      : 'The shop can still display its local menu while the connection is checked.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* MESSAGES */}
          <div className="px-5 pt-4">
            {message && (
              <div className="rounded-xl bg-green-100 border border-green-200 text-green-800 px-4 py-3 text-sm font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                {message}
              </div>
            )}

            {error && (
              <div className="mt-2 rounded-xl bg-red-100 border border-red-200 text-red-800 px-4 py-3 text-sm font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}
          </div>

          {/* CONTROLS */}
          <div className="px-5 pt-5">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={refreshProducts}
                disabled={refreshing}
                className="bg-stone-900 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${
                    refreshing ? 'animate-spin' : ''
                  }`}
                />

                {refreshing ? 'Refreshing...' : 'Refresh Products'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setError('');
                  setMessage('');
                  setShowAddProduct(true);
                }}
                className="bg-pink-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Product
              </button>
            </div>
          </div>

          {/* ADD PRODUCT */}
          {showAddProduct && (
            <div className="p-5">
              <div className="bg-white rounded-2xl border border-pink-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-extrabold text-lg">
                    Add New Product
                  </h3>

                  <button
                    type="button"
                    onClick={() => setShowAddProduct(false)}
                    className="text-stone-400 hover:text-stone-800"
                    aria-label="Close add product form"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">

                  {/* PRODUCT ID */}
                  <input
                    value={String(newProduct.id || '')}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        id: e.target.value,
                      })
                    }
                    placeholder="Product ID"
                    className="border rounded-xl px-3 py-2 text-sm"
                  />

                  {/* PRODUCT NAME */}
                  <input
                    value={String(newProduct.name || '')}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        name: e.target.value,
                      })
                    }
                    placeholder="Product name"
                    className="border rounded-xl px-3 py-2 text-sm"
                  />

                  {/* TAGLINE */}
                  <input
                    value={String(newProduct.tagline || '')}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        tagline: e.target.value,
                      })
                    }
                    placeholder="Tagline"
                    className="border rounded-xl px-3 py-2 text-sm"
                  />

                  {/* PRICE */}
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={Number(newProduct.price || 0)}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        price: Number(e.target.value),
                      })
                    }
                    placeholder="Price"
                    className="border rounded-xl px-3 py-2 text-sm"
                  />

                  {/* IMAGE */}
                  <input
                    value={String(newProduct.image || '')}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        image: e.target.value,
                      })
                    }
                    placeholder="Image URL"
                    className="border rounded-xl px-3 py-2 text-sm sm:col-span-2"
                  />

                  {/* DESCRIPTION */}
                  <textarea
                    value={String(newProduct.description || '')}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        description: e.target.value,
                      })
                    }
                    placeholder="Description"
                    rows={3}
                    className="border rounded-xl px-3 py-2 text-sm sm:col-span-2"
                  />

                  {/* STOCK */}
                  <input
                    type="number"
                    min="0"
                    value={Number(newProduct.stockCount || 0)}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        stockCount: Number(e.target.value),
                      })
                    }
                    placeholder="Stock count"
                    className="border rounded-xl px-3 py-2 text-sm"
                  />

                  {/* CATEGORY */}
                  <input
                    value={String(newProduct.category || '')}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        category: e.target.value as Product['category'],
                      })
                    }
                    placeholder="Category"
                    className="border rounded-xl px-3 py-2 text-sm"
                  />
                </div>

                <button
                  type="button"
                  onClick={createProduct}
                  disabled={saving}
                  className="mt-4 bg-green-600 text-white px-5 py-3 rounded-xl font-bold text-sm flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />

                  {saving ? 'Saving...' : 'Save New Product'}
                </button>
              </div>
            </div>
          )}

          {/* PRODUCT LIST */}
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-extrabold text-stone-900">
                  Product Inventory
                </h3>

                <p className="text-xs text-stone-500">
                  {products.length} product
                  {products.length === 1 ? '' : 's'} loaded
                </p>
              </div>

              <Package className="w-6 h-6 text-pink-500" />
            </div>

            <div className="space-y-3">
              {products.length === 0 ? (
                <div className="bg-white border border-dashed border-stone-300 rounded-2xl p-8 text-center">
                  <Package className="w-10 h-10 mx-auto text-stone-300 mb-2" />

                  <p className="font-bold text-stone-600">
                    No products loaded
                  </p>
                </div>
              ) : (
                products.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white border border-stone-200 rounded-2xl p-4"
                  >
                    {editingProduct?.id === product.id ? (
                      <div className="space-y-3">

                        {/* EDIT NAME */}
                        <input
                          value={editingProduct.name}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              name: e.target.value,
                            })
                          }
                          className="w-full border rounded-xl px-3 py-2 text-sm font-bold"
                        />

                        {/* EDIT TAGLINE */}
                        <input
                          value={editingProduct.tagline}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              tagline: e.target.value,
                            })
                          }
                          className="w-full border rounded-xl px-3 py-2 text-sm"
                        />

                        {/* EDIT DESCRIPTION */}
                        <textarea
                          value={editingProduct.description}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              description: e.target.value,
                            })
                          }
                          rows={3}
                          className="w-full border rounded-xl px-3 py-2 text-sm"
                        />

                        {/* EDIT PRICE AND STOCK */}
                        <div className="grid grid-cols-2 gap-3">

                          <div>
                            <label className="text-xs font-bold text-stone-500">
                              Price
                            </label>

                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={editingProduct.price}
                              onChange={(e) =>
                                setEditingProduct({
                                  ...editingProduct,
                                  price: Number(e.target.value),
                                })
                              }
                              className="w-full border rounded-xl px-3 py-2 text-sm"
                            />
                          </div>

                          <div>
                            <label className="text-xs font-bold text-stone-500">
                              Stock
                            </label>

                            <input
                              type="number"
                              min="0"
                              value={editingProduct.stockCount}
                              onChange={(e) =>
                                setEditingProduct({
                                  ...editingProduct,
                                  stockCount: Number(e.target.value),
                                  inStock: Number(e.target.value) > 0,
                                })
                              }
                              className="w-full border rounded-xl px-3 py-2 text-sm"
                            />
                          </div>

                        </div>

                        {/* EDIT BUTTONS */}
                        <div className="flex gap-2">

                          <button
                            type="button"
                            onClick={saveProduct}
                            disabled={saving}
                            className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 disabled:opacity-50"
                          >
                            <Save className="w-4 h-4" />

                            {saving ? 'Saving...' : 'Save'}
                          </button>

                          <button
                            type="button"
                            onClick={() => setEditingProduct(null)}
                            className="bg-stone-100 text-stone-700 px-4 py-2 rounded-xl text-sm font-bold"
                          >
                            Cancel
                          </button>

                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">

                        {/* PRODUCT IMAGE */}
                        <div className="w-16 h-16 rounded-xl bg-pink-50 overflow-hidden shrink-0">

                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl">
                              🍪
                            </div>
                          )}

                        </div>

                        {/* PRODUCT DETAILS */}
                        <div className="flex-1 min-w-0">

                          <h4 className="font-extrabold text-stone-900">
                            {product.name}
                          </h4>

                          <p className="text-xs text-stone-500 truncate">
                            {product.tagline}
                          </p>

                          <div className="flex flex-wrap items-center gap-2 mt-2">

                            <span className="text-xs font-bold bg-pink-50 text-pink-700 px-2 py-1 rounded-full">
                              R{product.price}
                            </span>

                            <span
                              className={`text-xs font-bold px-2 py-1 rounded-full ${
                                product.inStock
                                  ? 'bg-green-50 text-green-700'
                                  : 'bg-red-50 text-red-700'
                              }`}
                            >
                              {product.inStock
                                ? `${product.stockCount} in stock`
                                : 'Out of stock'}
                            </span>

                          </div>
                        </div>

                        {/* EDIT BUTTON */}
                        <button
                          type="button"
                          onClick={() => {
                            setError('');
                            setMessage('');
                            setEditingProduct({ ...product });
                          }}
                          className="bg-stone-900 text-white px-4 py-2 rounded-xl text-sm font-bold"
                        >
                          Edit
                        </button>

                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* FOOTER */}
          <div className="border-t border-stone-200 px-5 py-4 flex justify-between items-center">
            <span className="text-xs text-stone-400">
              The Biscuit Plug • Baker Admin
            </span>

            <button
              type="button"
              onClick={onClose}
              className="text-sm font-bold text-stone-600 hover:text-stone-900"
            >
              Close
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

/*
 * IMPORTANT:
 * This named export is required by App.tsx:
 *
 * import { AdminDashboard } from './components/AdminDashboard';
 *
 * The default export below also allows the component to be imported
 * as a default export elsewhere.
 */
export default AdminDashboard;
