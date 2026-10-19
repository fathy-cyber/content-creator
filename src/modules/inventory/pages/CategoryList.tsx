import { useState, useEffect } from 'react';
import { 
  Search, Plus, FolderTree, Edit, Trash2, ChevronRight
} from 'lucide-react';
import { inventoryService, type Category } from '../inventoryService';

export default function CategoryList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  useEffect(() => {
    refreshCategories();
  }, []);

  const refreshCategories = async () => {
    const categories = await inventoryService.getCategories();
    setCategories(categories);
  };

  const filteredCategories = categories.filter(cat => 
    !searchQuery || cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = async () => {
    const newCategory = await inventoryService.createCategory({ name: 'New Category' });
    setEditingCategory(newCategory);
    await refreshCategories();
  };

  const handleSave = async () => {
    if (!editingCategory) return;
    await inventoryService.updateCategory(editingCategory.id, editingCategory);
    setEditingCategory(null);
    await refreshCategories();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this category?')) {
      await inventoryService.deleteCategory(id);
      await refreshCategories();
    }
  };

  if (editingCategory) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setEditingCategory(null)}
            className="flex items-center gap-2 text-zinc-600"
          >
            ← Back to Categories
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
          >
            Save
          </button>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Category Name</label>
            <input
              type="text"
              value={editingCategory.name}
              onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
              className="w-full px-4 py-2 border border-zinc-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Description</label>
            <textarea
              value={editingCategory.description}
              onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-zinc-200 rounded-lg"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900">Categories</h2>
          <p className="text-zinc-500 mt-1">Product categories</p>
        </div>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Category
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input
          type="text"
          placeholder="Search categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-lg"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        {filteredCategories.map((cat) => (
          <div key={cat.id} className="bg-white rounded-xl border border-zinc-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 rounded-lg">
                <FolderTree className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-zinc-900">{cat.name}</h3>
                <p className="text-sm text-zinc-500">{cat.description || 'No description'}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setEditingCategory(cat)}
                className="flex-1 py-1.5 text-sm border border-zinc-200 rounded-lg hover:bg-zinc-50"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(cat.id)}
                className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <div className="text-center py-12 text-zinc-400">
          <FolderTree className="w-12 h-12 mx-auto mb-4" />
          <p>No categories</p>
        </div>
      )}
    </div>
  );
}