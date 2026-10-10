import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { mockInventory } from '../../lib/mockData';
import { InventoryItem, InventoryTransaction } from '../../types';
import { SearchInput } from '../../components/common/SearchInput';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { generateCustomId, formatDate, formatCurrency } from '../../lib/utils';
import {
  Package,
  PlusCircle,
  AlertTriangle,
  MinusCircle,
  History,
  CheckCircle2,
  Clock,
  Layers,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const InventoryList: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>(mockInventory);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modals
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [adjustItem, setAdjustItem] = useState<{ item: InventoryItem; mode: 'add' | 'deduct' } | null>(null);
  const [adjustQty, setAdjustQty] = useState<number>(10);
  const [adjustReason, setAdjustReason] = useState('');

  // Add Item form state
  const [name, setName] = useState('');
  const [genericName, setGenericName] = useState('');
  const [category, setCategory] = useState<InventoryItem['category']>('analgesic');
  const [stock, setStock] = useState<number>(100);
  const [unit, setUnit] = useState('tablets');
  const [reorderLevel, setReorderLevel] = useState<number>(30);
  const [unitPrice, setUnitPrice] = useState<number>(0.5);
  const [batchNumber, setBatchNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('2027-12-31');
  const [supplier, setSupplier] = useState('');
  const [location, setLocation] = useState('Pharmacy Shelf A-01');

  const lowStockItems = items.filter(
    i => i.currentStock <= i.reorderLevel || i.status === 'low_stock'
  );

  const handleAddNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !batchNumber) return;

    const code = generateCustomId('MED');
    const newItem: InventoryItem = {
      id: `inv-${Date.now()}`,
      itemCode: code,
      name,
      genericName,
      category,
      currentStock: stock,
      unit,
      reorderLevel,
      unitPrice,
      batchNumber,
      expiryDate,
      supplier: supplier || 'Standard Healthcare Supplies Ltd.',
      location,
      status: stock <= reorderLevel ? 'low_stock' : 'in_stock',
      updatedAt: new Date().toISOString(),
    };

    setItems([newItem, ...items]);
    setIsAddItemOpen(false);
    toast.success(`Inventory stock added: ${name} (${code})`);
  };

  const handleAdjustStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustItem) return;
    if (adjustQty <= 0) {
      toast.error('Adjustment quantity must be greater than zero');
      return;
    }

    const current = adjustItem.item.currentStock;
    let newStock = current;

    if (adjustItem.mode === 'deduct') {
      if (adjustQty > current) {
        toast.error(`Invalid deduction: requested ${adjustQty} exceeds available stock of ${current}`);
        return;
      }
      newStock = current - adjustQty;
    } else {
      newStock = current + adjustQty;
    }

    const newStatus =
      newStock <= 0 ? 'out_of_stock' : newStock <= adjustItem.item.reorderLevel ? 'low_stock' : 'in_stock';

    // Update item
    setItems(prev =>
      prev.map(i =>
        i.id === adjustItem.item.id
          ? {
              ...i,
              currentStock: newStock,
              status: newStatus,
              updatedAt: new Date().toISOString(),
            }
          : i
      )
    );

    // Record audit transaction
    const newTxn: InventoryTransaction = {
      id: `txn-${Date.now()}`,
      itemId: adjustItem.item.id,
      itemName: adjustItem.item.name,
      type: adjustItem.mode === 'add' ? 'addition' : 'dispensed',
      quantity: adjustQty,
      previousStock: current,
      newStock,
      reason: adjustReason || `${adjustItem.mode === 'add' ? 'Stock batch intake' : 'Pharmacy ward dispensation'}`,
      performedBy: user?.fullName || 'Hospital Pharmacist',
      date: new Date().toISOString(),
    };

    setTransactions([newTxn, ...transactions]);
    toast.success(
      `Stock updated for ${adjustItem.item.name}: ${current} -> ${newStock} ${adjustItem.item.unit}`
    );
    setAdjustItem(null);
    setAdjustReason('');
  };

  const filteredItems = items.filter(i => {
    const matchesSearch =
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.itemCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.batchNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === 'all' || i.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-sky-600" />
            Pharmacy Formulary & Supply Inventory
          </h1>
          <p className="text-xs text-slate-500">
            Real-time medicine stocks, batch expiry tracking, and dispensary audit trail
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsAddItemOpen(true)}
          leftIcon={<PlusCircle className="w-4 h-4" />}
        >
          Add Item / Batch
        </Button>
      </div>

      {/* Low Stock Warning Alert */}
      {lowStockItems.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 flex items-start gap-3 text-xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-900 dark:text-amber-200">
              Low Stock Alert ({lowStockItems.length} items below safety reorder threshold):
            </span>
            <p className="text-slate-700 dark:text-slate-300 mt-0.5">
              {lowStockItems.map(i => `${i.name} (${i.currentStock} ${i.unit} left)`).join(' • ')}
            </p>
          </div>
        </div>
      )}

      {/* Filter Row */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="w-full md:w-80">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by medicine, code, or batch..."
          />
        </div>

        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 capitalize"
        >
          <option value="all">All Drug Categories</option>
          <option value="antibiotic">Antibiotics</option>
          <option value="analgesic">Analgesics & Antipyretics</option>
          <option value="cardiovascular">Cardiovascular</option>
          <option value="surgical">Surgical Fluids & Supplies</option>
          <option value="ppe">Personal Protective Equipment</option>
          <option value="vaccine">Vaccines & Biologicals</option>
        </select>
      </div>

      {/* Inventory Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase font-semibold">
              <tr>
                <th className="p-3.5">Item Code</th>
                <th className="p-3.5">Medicine / Item Name</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5 text-center">Current Stock</th>
                <th className="p-3.5 text-center">Reorder Threshold</th>
                <th className="p-3.5">Batch / Expiry</th>
                <th className="p-3.5">Unit Price</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-right">Stock Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="p-3.5 font-mono font-bold text-sky-700 dark:text-sky-400">
                    {item.itemCode}
                  </td>
                  <td className="p-3.5">
                    <div className="font-bold text-slate-900 dark:text-white">{item.name}</div>
                    {item.genericName && (
                      <div className="text-[10px] text-slate-400 italic">{item.genericName}</div>
                    )}
                  </td>
                  <td className="p-3.5 capitalize text-slate-600 dark:text-slate-400">
                    {item.category}
                  </td>
                  <td className="p-3.5 text-center font-bold text-sm">
                    <span
                      className={
                        item.currentStock <= item.reorderLevel
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-slate-900 dark:text-white'
                      }
                    >
                      {item.currentStock}
                    </span>{' '}
                    <span className="text-[11px] font-normal text-slate-400">{item.unit}</span>
                  </td>
                  <td className="p-3.5 text-center text-slate-500">
                    {item.reorderLevel} {item.unit}
                  </td>
                  <td className="p-3.5">
                    <div className="font-mono text-slate-700 dark:text-slate-300">{item.batchNumber}</div>
                    <div className="text-[10px] text-slate-400">Exp: {formatDate(item.expiryDate)}</div>
                  </td>
                  <td className="p-3.5 font-medium text-slate-800 dark:text-slate-200">
                    {formatCurrency(item.unitPrice)}
                  </td>
                  <td className="p-3.5 text-center">
                    <Badge
                      variant={
                        item.status === 'in_stock'
                          ? 'success'
                          : item.status === 'low_stock'
                          ? 'warning'
                          : 'danger'
                      }
                      size="sm"
                    >
                      {item.status.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          setAdjustItem({ item, mode: 'add' });
                          setAdjustQty(50);
                        }}
                        className="p-1.5 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold"
                        title="Intake stock"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setAdjustItem({ item, mode: 'deduct' });
                          setAdjustQty(10);
                        }}
                        className="p-1.5 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold"
                        title="Deduct stock / Dispense"
                      >
                        <MinusCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Stock Modal */}
      {adjustItem && (
        <Modal
          isOpen={!!adjustItem}
          onClose={() => setAdjustItem(null)}
          title={`${adjustItem.mode === 'add' ? 'Stock Intake' : 'Dispense Stock'} — ${adjustItem.item.name}`}
          subtitle={`Current stock: ${adjustItem.item.currentStock} ${adjustItem.item.unit}`}
          maxWidth="md"
        >
          <form onSubmit={handleAdjustStock} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold mb-1">
                Quantity to {adjustItem.mode === 'add' ? 'Add' : 'Deduct'} *
              </label>
              <input
                type="number"
                min="1"
                required
                value={adjustQty}
                onChange={e => setAdjustQty(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white font-bold text-base"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Reason / Clinical Requisition Note</label>
              <input
                type="text"
                value={adjustReason}
                onChange={e => setAdjustReason(e.target.value)}
                placeholder={
                  adjustItem.mode === 'add'
                    ? 'Purchase order intake batch #PO-8821'
                    : 'Dispensed for ICU patient emergency order'
                }
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button variant="outline" type="button" onClick={() => setAdjustItem(null)}>
                Cancel
              </Button>
              <Button
                variant={adjustItem.mode === 'add' ? 'success' : 'danger'}
                type="submit"
              >
                Confirm {adjustItem.mode === 'add' ? 'Intake' : 'Deduction'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add New Item Modal */}
      <Modal
        isOpen={isAddItemOpen}
        onClose={() => setIsAddItemOpen(false)}
        title="Register Inventory Item / Batch"
        subtitle="Specify batch number, expiry date, category, and reorder threshold"
        maxWidth="2xl"
      >
        <form onSubmit={handleAddNewItem} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">Item / Medicine Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Ciprofloxacin 500mg Tablets"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Generic Name</label>
              <input
                type="text"
                value={genericName}
                onChange={e => setGenericName(e.target.value)}
                placeholder="e.g. Ciprofloxacin Hydrochloride"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold mb-1">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white capitalize"
              >
                <option value="antibiotic">Antibiotic</option>
                <option value="analgesic">Analgesic</option>
                <option value="cardiovascular">Cardiovascular</option>
                <option value="surgical">Surgical Fluid</option>
                <option value="ppe">PPE</option>
                <option value="vaccine">Vaccine</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1">Current Stock Quantity</label>
              <input
                type="number"
                min="0"
                value={stock}
                onChange={e => setStock(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Unit of Measure</label>
              <input
                type="text"
                value={unit}
                onChange={e => setUnit(e.target.value)}
                placeholder="tablets, vials, boxes"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold mb-1">Reorder Safety Level</label>
              <input
                type="number"
                min="1"
                value={reorderLevel}
                onChange={e => setReorderLevel(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Unit Price ($ USD)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={unitPrice}
                onChange={e => setUnitPrice(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Batch Number *</label>
              <input
                type="text"
                required
                value={batchNumber}
                onChange={e => setBatchNumber(e.target.value)}
                placeholder="BATCH-2026-X"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold mb-1">Expiry Date *</label>
              <input
                type="date"
                required
                value={expiryDate}
                onChange={e => setExpiryDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Supplier / Manufacturer</label>
              <input
                type="text"
                value={supplier}
                onChange={e => setSupplier(e.target.value)}
                placeholder="Pfizer, Baxter, Novartis"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Storage Location</label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Pharmacy Shelf B-02"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setIsAddItemOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Register Stock Item
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
