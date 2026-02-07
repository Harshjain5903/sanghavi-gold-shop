import React, { useState, useEffect, useRef } from 'react';
import { useProducts } from '../context/ProductContext';
import { useCategories } from '../context/CategoryContext';
import { useSortOptions } from '../context/SortOptionsContext';
import { useFilterOptions } from '../context/FilterOptionsContext';
import { Product, NavItem, ProductSpecification } from '../types';
import { MegaMenuSection } from '../types';
import { 
    Plus, Edit2, Trash2, Save, Loader, 
    LayoutDashboard, Package, LogOut, Search, ArrowUpDown,
  ChevronRight, ChevronDown, ChevronUp, Image as ImageIcon,
  AlertCircle, Layers, List, CheckCircle, Store, FolderPlus,
    Settings, X, Tag, TrendingUp, Sparkles, MinusCircle, UploadCloud, Filter,
  Megaphone, RefreshCw, GripVertical, Crown, ShieldAlert, Lock, Menu,
  EyeOff, Type
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { storage } from '../lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { SanghaviLogo } from '../components/Navbar';
import { InputModal, ConfirmModal } from '../components/AdminModals';

// --- COMPONENTS ---

interface StatCardProps {
  title: string;
  value: string | number;
  icon: any;
  color: string;
  onClick: () => void;
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, onClick, subtitle }) => (
  <div 
    onClick={onClick}
    className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 cursor-pointer hover:shadow-md transition-all active:scale-95 relative overflow-hidden group"
  >
    <div className={`p-3 md:p-4 rounded-full ${color} text-white shadow-sm group-hover:scale-110 transition-transform`}>
      <Icon size={24} className="md:w-6 md:h-6 w-5 h-5" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-wider truncate">{title}</p>
      <h3 className="text-xl md:text-2xl font-serif font-bold text-gray-900 mt-1">{value}</h3>
      {subtitle && <p className="text-[10px] text-gray-400 mt-0.5 truncate">{subtitle}</p>}
    </div>
    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 opacity-50 group-hover:opacity-100 transition-opacity">
        <ChevronRight size={20} />
    </div>
  </div>
);

const ActionCard = ({ title, icon: Icon, onClick, color }: any) => (
    <button 
        onClick={onClick}
        className="flex flex-col items-center justify-center p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95 h-full w-full"
    >
        <div className={`w-10 h-10 rounded-full ${color} bg-opacity-10 flex items-center justify-center mb-2`}>
            <Icon size={20} className={color.replace('bg-', 'text-')} />
        </div>
        <span className="text-xs font-bold text-gray-700 text-center">{title}</span>
    </button>
);

const AdminPage: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const { categories, saveCategories } = useCategories();
    const { sortOptions, saveSortOptions, resetToDefault: resetSortOptions } = useSortOptions();
    const { filterSections, saveFilterSections, resetToDefault: resetFilterOptions } = useFilterOptions();
  
  // --- SECURITY STATE ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [shake, setShake] = useState(false); // For animation
  
  // --- MAIN APP STATE ---
    const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'add' | 'edit' | 'categories' | 'filters' | 'trending' | 'collections'>('dashboard');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [imageUploading, setImageUploading] = useState(false);
    const [videoUploading, setVideoUploading] = useState(false);
  const [managerSearch, setManagerSearch] = useState('');
  const [dbStatus, setDbStatus] = useState<'connecting' | 'connected'>('connecting');
  
  // MOBILE MENU STATE
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation(); // To read URL params for secret unlock

  // CATEGORY MANAGER STATE
  const [localCategories, setLocalCategories] = useState<NavItem[]>([]);
  const [catExpanded, setCatExpanded] = useState<string | null>(null);
  const [draggedCategoryIndex, setDraggedCategoryIndex] = useState<number | null>(null);
    const [localSortOptions, setLocalSortOptions] = useState<string[]>([]);
    const [newSortOption, setNewSortOption] = useState('');
    const [localFilterSections, setLocalFilterSections] = useState<MegaMenuSection[]>([]);
    const [newFilterSectionTitle, setNewFilterSectionTitle] = useState('');
  
  // MODAL STATES
  const [modalType, setModalType] = useState<'none' | 'add-cat' | 'rename-cat' | 'add-section' | 'add-item' | 'delete-cat' | 'delete-section' | 'delete-item'>('none');
  const [targetIndex, setTargetIndex] = useState<{cat: number, sec?: number, item?: number} | null>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);

  const ADMIN_PIN = '34982';
  const MAX_ATTEMPTS = 3;

  // Scroll to top on tab change
  useEffect(() => {
    window.scrollTo(0, 0);
    setIsMobileMenuOpen(false); // Close mobile menu on nav
  }, [activeTab]);

  // --- SECURITY: INITIALIZE & SECRET UNLOCK ---
  useEffect(() => {
    // 1. Check for Secret Unlock Command in URL (?cmd=reset_security)
    const params = new URLSearchParams(location.search);
    if (params.get('cmd') === 'reset_security') {
        localStorage.removeItem('admin_failed_attempts');
        localStorage.removeItem('admin_locked_status');
        setAttempts(0);
        setIsLocked(false);
        alert("🛡️ Security Protocol Reset: Lock removed.");
        // Clear URL to hide the secret
        navigate('/admin', { replace: true });
        return;
    }

    // 2. Load Persisted Security State
    const storedAttempts = localStorage.getItem('admin_failed_attempts');
    const storedLock = localStorage.getItem('admin_locked_status');

    if (storedLock === 'true') {
        setIsLocked(true);
        setAttempts(MAX_ATTEMPTS);
    } else if (storedAttempts) {
        setAttempts(Number(storedAttempts));
    }
  }, [location.search, navigate]);

  useEffect(() => {
    setLocalCategories(categories);
  }, [categories]);

    useEffect(() => {
        setLocalSortOptions(sortOptions);
    }, [sortOptions]);

    useEffect(() => {
        setLocalFilterSections(filterSections);
    }, [filterSections]);

  // Database Connection Mock
  useEffect(() => {
    if (products.length > 0 || categories.length > 0) {
        setDbStatus('connected');
    } else {
        const timer = setTimeout(() => setDbStatus('connected'), 1500);
        return () => clearTimeout(timer);
    }
  }, [products, categories]);

  // --- SECURITY: LOGIN HANDLER ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLocked) return;

    if (password === ADMIN_PIN) {
      // SUCCESS
      setIsAuthenticated(true);
      // Reset security stats on success
      setAttempts(0);
      localStorage.removeItem('admin_failed_attempts');
      localStorage.removeItem('admin_locked_status');
      setPassword('');
    } else {
      // FAILED
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      localStorage.setItem('admin_failed_attempts', String(newAttempts));
      
      // Trigger Shake Animation
      setShake(true);
      setTimeout(() => setShake(false), 500);

      if (newAttempts >= MAX_ATTEMPTS) {
        setIsLocked(true);
        localStorage.setItem('admin_locked_status', 'true');
      }
    }
  };

  // --- DEFAULT SPECIFICATIONS TEMPLATE ---
  const DEFAULT_SPECS: ProductSpecification[] = [
      { key: 'Material', value: 'Gold' },
      { key: 'Purity', value: '22kt' },
      { key: 'Gross Weight', value: '' }, 
      { key: 'Net Weight', value: '' },   
      { key: 'Certification', value: 'BIS Hallmarked' }
  ];

  const initialFormState: Product = {
    id: '',
    name: '',
    price: 0,
    priceOnRequest: false,
    category: [], 
    subcategory: '',
    image: '',
    images: [], 
        videos: [],
    description: '',
    specifications: DEFAULT_SPECS, 
    inStock: true,
    isNew: false,
    isTrending: false,
    isFeaturedCollection: false 
  };

  const [formData, setFormData] = useState<Product>(initialFormState);

    const normalizeText = (value: string) => value
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    const singularize = (word: string) => word.replace(/s$/, '');

    const allSubcategoryItems = React.useMemo(() => (
        localCategories.flatMap(c => c.sections).flatMap(section => section.items)
    ), [localCategories]);

    const detectCategories = (product: Product) => {
        const text = normalizeText(`${product.name} ${product.description}`);
        const current = new Set((product.category || []).filter(Boolean));
        const availableCategories = new Set(localCategories.map(c => c.category));

        const addIfAvailable = (value: string) => {
            if (availableCategories.has(value)) current.add(value);
        };

        if (/\bsilver\b/.test(text)) {
            addIfAvailable('Silver');
            const mensSilverCat = localCategories.find(c => {
                const label = normalizeText(c.category);
                return label.includes('silver') && (label.includes('men') || label.includes('mens') || label.includes('men s'));
            });
            if (mensSilverCat) current.add(mensSilverCat.category);
        }
        if (/\bgold\b/.test(text)) addIfAvailable('Gold');
        if (/\bdiamond\b/.test(text)) addIfAvailable('Diamond');
        if (/\bkada\b|\bkadas\b|\bbangle\b|\bbracelet\b/.test(text)) {
            addIfAvailable('Bracelets & Bangles');
        }

        return Array.from(current);
    };

    const detectSubcategory = (product: Product) => {
        const text = normalizeText(`${product.name} ${product.description}`);
        const tokens = new Set(text.split(' ').filter(t => t.length > 2).map(singularize));

        if (/\bkada\b|\bkadas\b|\bbangle\b|\bbracelet\b/.test(text)) {
            if (/\bsilver\b/.test(text)) return 'Silver Kada';
            return 'Kada';
        }
        if (/\bchoker\b|\bchokers\b|\bnecklace\b|\bpendant\b/.test(text)) return 'Necklaces';
        if (/\bring\b|\brings\b|\bsolitaire\b/.test(text)) return 'Rings';
        if (/\bearring\b|\bjhumka\b|\bstud\b|\bhoop\b/.test(text)) return 'Earrings';

        let best: { label: string; score: number } | null = null;

        allSubcategoryItems.forEach(label => {
            const labelNorm = normalizeText(label);
            const labelTokens = labelNorm.split(' ').filter(t => t.length > 2).map(singularize);
            if (labelTokens.length === 0) return;

            let score = 0;
            labelTokens.forEach(token => {
                if (tokens.has(token)) score += 12;
            });

            if (labelTokens.every(t => tokens.has(t))) score += 40;
            if (labelNorm.includes('silver') && tokens.has('silver')) score += 15;
            if (labelNorm.includes('kada') && tokens.has('kada')) score += 20;

            if (!best || score > best.score) {
                best = { label, score };
            }
        });

        return best && best.score >= 30 ? best.label : '';
    };

  // --- HELPER: GET ACTIVE CATEGORY CONFIG ---
  const activeCategoryConfig = React.useMemo(() => {
    if (!formData.category || formData.category.length === 0) return null;
    return localCategories.find(c => c.category === formData.category[0]);
  }, [formData.category, localCategories]);

  // --- HELPER: TOGGLE ATTRIBUTE ---
  const toggleAttribute = (attribute: string) => {
    setFormData(prev => {
      const currentCats = prev.category || [];
      const mainCat = currentCats[0];
      const otherCats = currentCats.slice(1);

      let newOtherCats;
      if (otherCats.includes(attribute)) {
        newOtherCats = otherCats.filter(c => c !== attribute);
      } else {
        newOtherCats = [...otherCats, attribute];
      }

      return {
        ...prev,
        category: [mainCat, ...newOtherCats]
      };
    });
  };

  const toggleTrending = async (product: Product, status: boolean) => {
    try {
        await updateProduct({ ...product, isTrending: status });
    } catch (e) {
        console.error(e);
        alert("Failed to update trending status");
    }
  };

  const toggleCollection = async (product: Product, status: boolean) => {
    try {
        await updateProduct({ ...product, isFeaturedCollection: status });
    } catch (e) {
        console.error(e);
        alert("Failed to update collection status");
    }
  };

  const handleSpecChange = (index: number, field: 'key' | 'value', val: string) => {
    const newSpecs = [...(formData.specifications || [])];
    newSpecs[index] = { ...newSpecs[index], [field]: val };
    setFormData({ ...formData, specifications: newSpecs });
  };

  const addSpecRow = () => {
    setFormData({
      ...formData,
      specifications: [...(formData.specifications || []), { key: '', value: '' }]
    });
  };

  const removeSpecRow = (index: number) => {
    const newSpecs = [...(formData.specifications || [])];
    newSpecs.splice(index, 1);
    setFormData({ ...formData, specifications: newSpecs });
  };

  const resetSpecsToDefault = () => {
    if(window.confirm("Reset specifications to default template? This will clear current values.")) {
        setFormData({ ...formData, specifications: DEFAULT_SPECS });
    }
  };

    const uploadWithTimeout = (task: ReturnType<typeof uploadBytesResumable>, timeoutMs: number) => {
        return new Promise<ReturnType<typeof uploadBytesResumable>['snapshot']>((resolve, reject) => {
            const timer = setTimeout(() => {
                task.cancel();
                reject(new Error('Upload timed out. Please try again on a stronger network.'));
            }, timeoutMs);

            task.on('state_changed', undefined, (error) => {
                clearTimeout(timer);
                reject(error);
            }, () => {
                clearTimeout(timer);
                resolve(task.snapshot);
            });
        });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'product' | 'category', catIndex?: number) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        setImageUploading(true);
        try {
            const maxBytes = 100 * 1024 * 1024; // 100MB per image
            const maxImages = 50;
            const timeoutMs = 120000;
            const skipped: string[] = [];

            if (target === 'product') {
                const newImageUrls: string[] = [];
                const existingImages = formData.images || (formData.image ? [formData.image] : []);
                const remainingSlots = Math.max(0, maxImages - existingImages.length);

                const uploadTargets = Array.from(files).slice(0, remainingSlots).map((file) => {
                    if (file.size > maxBytes) {
                        skipped.push(`${file.name} (over 100MB)`);
                        return Promise.reject(new Error('File too large'));
                    }
                    const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
                    const task = uploadBytesResumable(storageRef, file, { contentType: file.type || 'image/jpeg' });
                    return uploadWithTimeout(task, timeoutMs).then(snapshot => getDownloadURL(snapshot.ref));
                });

                const results = await Promise.allSettled(uploadTargets);
                results.forEach((result, index) => {
                    if (result.status === 'fulfilled') {
                        newImageUrls.push(result.value);
                    } else if (!skipped.includes(files[index]?.name || '')) {
                        skipped.push(`${files[index]?.name || 'image'} (upload failed)`);
                    }
                });

                if (newImageUrls.length === 0) {
                    const reason = skipped.length > 0 ? `Skipped: ${skipped.join(', ')}` : 'No valid files selected.';
                    alert(`⚠️ Upload Failed. ${reason}`);
                    return;
                }

                setFormData(prev => {
                    const currentImages = prev.images || (prev.image ? [prev.image] : []);
                    const updatedImages = [...currentImages, ...newImageUrls];
                    return {
                        ...prev,
                        images: updatedImages,
                        image: updatedImages.length > 0 ? updatedImages[0] : ''
                    };
                });
            } else if (target === 'category' && catIndex !== undefined) {
                const file = files[0];
                if (file.size > maxBytes) {
                    alert('⚠️ Upload Failed. Image is larger than 100MB.');
                    return;
                }
                const storageRef = ref(storage, `categories/${Date.now()}_${file.name}`);
                const task = uploadBytesResumable(storageRef, file, { contentType: file.type || 'image/jpeg' });
                const snapshot = await uploadWithTimeout(task, timeoutMs);
                const downloadURL = await getDownloadURL(snapshot.ref);
                const updatedCats = [...localCategories];
                updatedCats[catIndex] = { ...updatedCats[catIndex], image: downloadURL };
                setLocalCategories(updatedCats);
                await saveCategories(updatedCats);
            }
        } catch (error: any) {
            console.error("Error uploading image:", error);
            const message = error?.message || 'Unknown error';
            alert(`⚠️ Upload Failed. ${message}`);
        } finally {
            setImageUploading(false);
            if (e.target) {
                e.target.value = '';
            }
        }
    };

    const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        setVideoUploading(true);
        try {
            const maxBytes = 500 * 1024 * 1024; // 500MB per video
            const maxVideos = 10;
            const timeoutMs = 180000;
            const skipped: string[] = [];

            const newVideoUrls: string[] = [];
            const existingVideos = formData.videos || [];
            const remainingSlots = Math.max(0, maxVideos - existingVideos.length);

            const uploadTargets = Array.from(files).slice(0, remainingSlots).map((file) => {
                if (file.size > maxBytes) {
                    skipped.push(`${file.name} (over 500MB)`);
                    return Promise.reject(new Error('File too large'));
                }
                const storageRef = ref(storage, `products/videos/${Date.now()}_${file.name}`);
                const task = uploadBytesResumable(storageRef, file, { contentType: file.type || 'video/mp4' });
                return uploadWithTimeout(task, timeoutMs).then(snapshot => getDownloadURL(snapshot.ref));
            });

            const results = await Promise.allSettled(uploadTargets);
            results.forEach((result, index) => {
                if (result.status === 'fulfilled') {
                    newVideoUrls.push(result.value);
                } else if (!skipped.includes(files[index]?.name || '')) {
                    skipped.push(`${files[index]?.name || 'video'} (upload failed)`);
                }
            });

            if (newVideoUrls.length === 0) {
                const reason = skipped.length > 0 ? `Skipped: ${skipped.join(', ')}` : 'No valid files selected.';
                alert(`⚠️ Upload Failed. ${reason}`);
                return;
            }

            setFormData(prev => ({
                ...prev,
                videos: [...(prev.videos || []), ...newVideoUrls]
            }));
        } catch (error: any) {
            console.error('Error uploading video:', error);
            const message = error?.message || 'Unknown error';
            alert(`⚠️ Upload Failed. ${message}`);
        } finally {
            setVideoUploading(false);
            if (e.target) {
                e.target.value = '';
            }
        }
    };

  const removeProductImage = (index: number) => {
      setFormData(prev => {
          const currentImages = [...(prev.images || [])];
          currentImages.splice(index, 1);
          return {
              ...prev,
              images: currentImages,
              image: currentImages.length > 0 ? currentImages[0] : '' // Update primary image
          };
      });
  };

  const removeProductVideo = (index: number) => {
      setFormData(prev => {
          const currentVideos = [...(prev.videos || [])];
          currentVideos.splice(index, 1);
          return {
              ...prev,
              videos: currentVideos
          };
      });
  };

  const handleProductSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const finalData = { ...formData };
      
      // 1. Ensure basic category presence
      if ((!finalData.category || finalData.category.length === 0) && localCategories.length > 0) {
          finalData.category = [localCategories[0].category];
      }

      // 2. SMART CATEGORIZATION ENGINE (Amazon-style Auto Tagging)
      finalData.category = detectCategories(finalData);

            // 2b. SMART SUBCATEGORY NORMALIZATION (Free AI-like matching)
            const detectedSub = detectSubcategory(finalData);
            if (detectedSub && !finalData.subcategory?.trim()) {
                finalData.subcategory = detectedSub;
            }

      // 3. Image Handling
      if (!finalData.images || finalData.images.length === 0) {
          if (finalData.image) finalData.images = [finalData.image];
      } else {
          finalData.image = finalData.images[0];
      }

      // 4. Specs Standardization
      const weightSpec = finalData.specifications?.find(s => s.key.toLowerCase().includes('weight'));
      const puritySpec = finalData.specifications?.find(s => s.key.toLowerCase() === 'purity');
      if (weightSpec) finalData.weight = weightSpec.value;
      if (puritySpec) finalData.purity = puritySpec.value;

      if (activeTab === 'add') {
        await addProduct(finalData);
        alert('✅ Product Added Successfully!');
      } else if (activeTab === 'edit' && editingProduct) {
        await updateProduct(finalData);
        alert('✅ Product Updated Successfully!');
      }
      setActiveTab('products');
      setFormData(initialFormState);
    } catch (error) {
      alert("Error saving product.");
      console.error(error);
    }
  };

  const startEdit = (product: Product) => {
    setEditingProduct(product);
    let specs = product.specifications || [];
    if (specs.length === 0) {
        specs = DEFAULT_SPECS;
        if (product.purity) {
             const idx = specs.findIndex(s => s.key === 'Purity');
             if(idx > -1) specs[idx] = { ...specs[idx], value: product.purity! };
        }
        if (product.weight) {
             const idx = specs.findIndex(s => s.key === 'Gross Weight');
             if(idx > -1) specs[idx] = { ...specs[idx], value: product.weight! };
        }
    }
    let imgs = product.images || [];
    if (imgs.length === 0 && product.image) {
        imgs = [product.image];
    }
    const vids = product.videos || [];
    setFormData({ ...product, specifications: specs, images: imgs, videos: vids, priceOnRequest: product.priceOnRequest || false });
    setActiveTab('edit');
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Are you sure? This cannot be undone.')) {
      await deleteProduct(id);
    }
  };

  const handleModalConfirm = async (value?: string) => {
    try {
      const updatedCats = [...localCategories];
      if (modalType === 'add-cat' && value) {
        updatedCats.push({
          label: value.toUpperCase(),
          category: value,
          sections: [
            { title: 'By Style', items: [] },
            { title: 'By Price', items: ['Under ₹20k', 'Above ₹50k'] }
          ],
          image: 'https://via.placeholder.com/400'
        });
      } 
      else if (modalType === 'rename-cat' && value && targetIndex) {
        updatedCats[targetIndex.cat].category = value;
        updatedCats[targetIndex.cat].label = value.toUpperCase();
      }
      else if (modalType === 'add-section' && value && targetIndex) {
        updatedCats[targetIndex.cat].sections.push({ title: value, items: [] });
      }
      else if (modalType === 'add-item' && value && targetIndex && targetIndex.sec !== undefined) {
        updatedCats[targetIndex.cat].sections[targetIndex.sec].items.push(value);
      }
      else if (modalType === 'delete-cat' && targetIndex) {
        updatedCats.splice(targetIndex.cat, 1);
      }
      else if (modalType === 'delete-section' && targetIndex && targetIndex.sec !== undefined) {
        updatedCats[targetIndex.cat].sections.splice(targetIndex.sec, 1);
      }
      else if (modalType === 'delete-item' && targetIndex && targetIndex.sec !== undefined && targetIndex.item !== undefined) {
        updatedCats[targetIndex.cat].sections[targetIndex.sec].items.splice(targetIndex.item, 1);
      }
      setLocalCategories(updatedCats);
      await saveCategories(updatedCats);
      setModalType('none');
      setTargetIndex(null);
    } catch (error) {
      console.error("Error updating categories:", error);
      alert("Failed to save changes.");
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedCategoryIndex(index);
  };

  const handleDragEnter = (index: number) => {
    if (draggedCategoryIndex === null || draggedCategoryIndex === index) return;
    const newCategories = [...localCategories];
    const draggedItem = newCategories[draggedCategoryIndex];
    newCategories.splice(draggedCategoryIndex, 1);
    newCategories.splice(index, 0, draggedItem);
    setDraggedCategoryIndex(index);
    setLocalCategories(newCategories);
  };

  const handleDragEnd = () => {
    setDraggedCategoryIndex(null);
  };

  // --- NEW FUNCTION: Manual Move for Mobile ---
  const moveCategory = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === localCategories.length - 1) return;
    
    const newCategories = [...localCategories];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap
    [newCategories[index], newCategories[targetIndex]] = [newCategories[targetIndex], newCategories[index]];
    
    setLocalCategories(newCategories);
  };

  const handleSaveOrder = async () => {
      try {
          await saveCategories(localCategories);
          alert("✅ Category order updated successfully on live website!");
      } catch (e) {
          console.error(e);
          alert("Failed to save order.");
      }
  };

  const updateSortOption = (index: number, value: string) => {
      setLocalSortOptions(prev => {
          const next = [...prev];
          next[index] = value;
          return next;
      });
  };

  const removeSortOption = (index: number) => {
      setLocalSortOptions(prev => prev.filter((_, idx) => idx !== index));
  };

  const moveSortOption = (index: number, direction: 'up' | 'down') => {
      if (direction === 'up' && index === 0) return;
      if (direction === 'down' && index === localSortOptions.length - 1) return;
      const next = [...localSortOptions];
      const target = direction === 'up' ? index - 1 : index + 1;
      [next[index], next[target]] = [next[target], next[index]];
      setLocalSortOptions(next);
  };

  const addSortOption = () => {
      const trimmed = newSortOption.trim();
      if (!trimmed) return;
      setLocalSortOptions(prev => [...prev, trimmed]);
      setNewSortOption('');
  };

  const handleSaveSortOptions = async () => {
      try {
          const cleaned = localSortOptions.map(opt => opt.trim()).filter(Boolean);
          await saveSortOptions(cleaned);
          alert('✅ Sort options updated successfully.');
      } catch (e) {
          console.error(e);
          alert('Failed to save sort options.');
      }
  };

  const updateFilterSectionTitle = (index: number, value: string) => {
      setLocalFilterSections(prev => {
          const next = [...prev];
          next[index] = { ...next[index], title: value };
          return next;
      });
  };

  const addFilterSection = () => {
      const trimmed = newFilterSectionTitle.trim();
      if (!trimmed) return;
      setLocalFilterSections(prev => [...prev, { title: trimmed, items: [] }]);
      setNewFilterSectionTitle('');
  };

  const removeFilterSection = (index: number) => {
      setLocalFilterSections(prev => prev.filter((_, idx) => idx !== index));
  };

  const moveFilterSection = (index: number, direction: 'up' | 'down') => {
      if (direction === 'up' && index === 0) return;
      if (direction === 'down' && index === localFilterSections.length - 1) return;
      const next = [...localFilterSections];
      const target = direction === 'up' ? index - 1 : index + 1;
      [next[index], next[target]] = [next[target], next[index]];
      setLocalFilterSections(next);
  };

  const updateFilterItem = (sectionIndex: number, itemIndex: number, value: string) => {
      setLocalFilterSections(prev => {
          const next = [...prev];
          const items = [...next[sectionIndex].items];
          items[itemIndex] = value;
          next[sectionIndex] = { ...next[sectionIndex], items };
          return next;
      });
  };

  const addFilterItem = (sectionIndex: number) => {
      setLocalFilterSections(prev => {
          const next = [...prev];
          next[sectionIndex] = { ...next[sectionIndex], items: [...next[sectionIndex].items, ''] };
          return next;
      });
  };

  const removeFilterItem = (sectionIndex: number, itemIndex: number) => {
      setLocalFilterSections(prev => {
          const next = [...prev];
          const items = next[sectionIndex].items.filter((_, idx) => idx !== itemIndex);
          next[sectionIndex] = { ...next[sectionIndex], items };
          return next;
      });
  };

  const handleSaveFilterOptions = async () => {
      try {
          const cleaned = localFilterSections
              .map(section => ({
                  title: section.title.trim(),
                  items: section.items.map(item => item.trim()).filter(Boolean)
              }))
              .filter(section => section.title && section.items.length > 0);
          await saveFilterSections(cleaned);
          alert('✅ Filter options updated successfully.');
      } catch (e) {
          console.error(e);
          alert('Failed to save filter options.');
      }
  };

  const filteredProducts = products.filter(product => {
    const safeCategories = product.category || [];
    const matchesCategory = selectedCategoryFilter === 'All' || safeCategories.includes(selectedCategoryFilter);
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.subcategory?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

    const autoTagMissingSubcategories = async () => {
        const candidates = products.filter(p => !p.subcategory || !p.subcategory.trim());
        if (candidates.length === 0) {
            alert('All products already have subcategories.');
            return;
        }

        if (!window.confirm(`Auto-tag ${candidates.length} products with missing subcategories?`)) {
            return;
        }

        let updatedCount = 0;
        for (const product of candidates) {
            const detected = detectSubcategory(product);
            if (!detected) continue;
            await updateProduct({ ...product, subcategory: detected });
            updatedCount += 1;
        }

        alert(`Auto-tagged ${updatedCount} products.`);
    };

    const smartSyncAllTags = async () => {
        let updatedCount = 0;
        for (const product of products) {
            const nextCategories = detectCategories(product);
            const detectedSub = product.subcategory?.trim() ? product.subcategory : detectSubcategory(product);

            const categoriesChanged =
                nextCategories.length !== (product.category || []).length ||
                nextCategories.some(cat => !(product.category || []).includes(cat));
            const subcategoryChanged = !!detectedSub && detectedSub !== product.subcategory;

            if (categoriesChanged || subcategoryChanged) {
                await updateProduct({
                    ...product,
                    category: categoriesChanged ? nextCategories : product.category,
                    subcategory: subcategoryChanged ? detectedSub : product.subcategory
                });
                updatedCount += 1;
            }
        }

        alert(`Smart sync complete. Updated ${updatedCount} products.`);
    };

    const applySuggestedTags = async (product: Product) => {
        const nextCategories = detectCategories(product);
        const detectedSub = product.subcategory?.trim() ? product.subcategory : detectSubcategory(product);

        const categoriesChanged =
            nextCategories.length !== (product.category || []).length ||
            nextCategories.some(cat => !(product.category || []).includes(cat));
        const subcategoryChanged = !!detectedSub && detectedSub !== product.subcategory;

        if (!categoriesChanged && !subcategoryChanged) {
            alert('No new tags found for this product.');
            return;
        }

        await updateProduct({
            ...product,
            category: categoriesChanged ? nextCategories : product.category,
            subcategory: subcategoryChanged ? detectedSub : product.subcategory
        });

        const categoryLabel = categoriesChanged ? nextCategories.join(', ') : (product.category || []).join(', ');
        const subLabel = subcategoryChanged ? detectedSub : (product.subcategory || '');
        alert(`Tags updated.\nCategory: ${categoryLabel || 'None'}\nSubcategory: ${subLabel || 'None'}`);
    };

  const trendingProducts = products.filter(p => p.isTrending);
  const collectionProducts = products.filter(p => p.isFeaturedCollection);
  const activeManagerProducts = activeTab === 'trending' ? trendingProducts : collectionProducts;
  const availableManagerProducts = products.filter(p => activeTab === 'trending' ? !p.isTrending : !p.isFeaturedCollection);

  // --- LOGIN SCREEN WITH SECURITY ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
            <div className="absolute top-0 left-0 w-64 h-64 bg-gold-400 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-brand-black rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className={`bg-white p-10 rounded-2xl shadow-2xl w-full max-w-sm border border-gray-100 transition-all duration-300 ${shake ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-brand-black rounded-full flex items-center justify-center shadow-lg text-gold-500">
               {isLocked ? <ShieldAlert size={32} /> : <Lock size={32} />}
            </div>
            <h2 className="text-3xl font-serif font-bold text-gray-900">Admin Portal</h2>
            <p className="text-sm text-gray-500 mt-2 font-medium">Sanghavi Gold</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
                <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Security PIN</label>
                    {!isLocked && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${attempts > 0 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                            {attempts > 0 ? `${MAX_ATTEMPTS - attempts} Tries Left` : 'Secure Login'}
                        </span>
                    )}
                </div>
                <input 
                  type="password" 
                  autoFocus
                  disabled={isLocked}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full border-2 p-4 rounded-xl text-center text-3xl tracking-[0.5em] outline-none transition-all duration-300 font-mono 
                    ${isLocked 
                        ? 'bg-gray-100 border-red-200 cursor-not-allowed text-gray-400' 
                        : 'border-gray-200 focus:border-brand-black focus:ring-4 focus:ring-gray-100'
                    }
                    ${shake ? 'border-red-500 text-red-500' : ''}
                  `}
                  placeholder={isLocked ? "•••••" : "•••••"}
                  maxLength={5}
                />
            </div>
            
            {isLocked ? (
              <div className="bg-red-50 border border-red-100 p-4 rounded-xl text-center space-y-2 animate-fade-in-up">
                 <h4 className="text-red-800 font-bold flex items-center justify-center gap-2"><ShieldAlert size={18}/> Access Locked</h4>
                 <p className="text-xs text-red-600 leading-relaxed">
                    Security protocol activated due to multiple failed attempts. IP Address logged.
                 </p>
                 <div className="pt-2 border-t border-red-100 mt-2">
                    <p className="text-xs font-bold text-gray-700">Contact Website Builder</p>
                    <p className="text-[10px] text-gray-400">(Or use master unlock key)</p>
                 </div>
              </div>
            ) : (
                <button 
                type="submit" 
                className="w-full py-4 rounded-xl font-bold transition shadow-lg bg-brand-black text-white hover:bg-gray-800 hover:shadow-xl active:scale-95 text-sm uppercase tracking-widest"
                >
                Authenticate
                </button>
            )}
          </form>

          <button onClick={() => navigate('/')} className="w-full text-center text-xs font-bold text-gray-400 mt-8 hover:text-brand-black transition uppercase tracking-wide">
              Return to Store
          </button>
          
          <div className="mt-8 flex justify-center gap-2 opacity-30">
             <div className="w-1 h-1 rounded-full bg-gray-400"></div>
             <div className="w-1 h-1 rounded-full bg-gray-400"></div>
             <div className="w-1 h-1 rounded-full bg-gray-400"></div>
          </div>
        </div>
        <style>{`
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                20%, 40%, 60%, 80% { transform: translateX(5px); }
            }
        `}</style>
      </div>
    );
  }

  // --- NAVIGATION CONFIG ---
  const SidebarContent = () => (
      <>
        <div className="p-6 border-b border-gray-100 flex-shrink-0 flex items-center gap-3">
            <div className="w-8 h-8 flex-shrink-0">
                <SanghaviLogo className="w-full h-full text-gold-500" />
            </div>
            <div>
                <h1 className="font-serif font-bold text-lg text-brand-black leading-tight">Sanghavi</h1>
                <p className="text-[10px] font-bold text-gold-600 uppercase tracking-widest leading-none">Gold</p>
            </div>
        </div>
        
        <div className="px-6 py-2">
            <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${dbStatus === 'connected' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <span className="text-xs text-gray-500 font-medium">{dbStatus === 'connected' ? 'Online' : 'Connecting...'}</span>
            </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-3 mt-4">Overview</div>
            <button 
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'dashboard' ? 'bg-gold-50 text-gold-700' : 'text-gray-600 hover:bg-gray-50'}`}
            >
                <LayoutDashboard size={18} /> Dashboard
            </button>
            
            <button 
                onClick={() => setActiveTab('categories')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'categories' ? 'bg-gold-50 text-gold-700' : 'text-gray-600 hover:bg-gray-50'}`}
            >
                <List size={18} /> Category Manager
            </button>

            <button 
                onClick={() => setActiveTab('filters')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'filters' ? 'bg-gold-50 text-gold-700' : 'text-gray-600 hover:bg-gray-50'}`}
            >
                <Filter size={18} /> Filter Options
            </button>

            <button 
                onClick={() => setActiveTab('sort')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'sort' ? 'bg-gold-50 text-gold-700' : 'text-gray-600 hover:bg-gray-50'}`}
            >
                <ArrowUpDown size={18} /> Sort Options
            </button>

            <button 
                onClick={() => setActiveTab('collections')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'collections' ? 'bg-gold-50 text-gold-700' : 'text-gray-600 hover:bg-gray-50'}`}
            >
                <Crown size={18} /> New Collection Manager
            </button>

            <button 
                onClick={() => setActiveTab('trending')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'trending' ? 'bg-gold-50 text-gold-700' : 'text-gray-600 hover:bg-gray-50'}`}
            >
                <TrendingUp size={18} /> Trending Manager
            </button>

            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-3 mt-6">Inventory</div>
            <button 
                onClick={() => setActiveTab('products')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'products' ? 'bg-gold-50 text-gold-700' : 'text-gray-600 hover:bg-gray-50'}`}
            >
                <Package size={18} /> All Products
            </button>
            <button 
                onClick={() => { setFormData(initialFormState); setActiveTab('add'); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'add' ? 'bg-gold-50 text-gold-700' : 'text-gray-600 hover:bg-gray-50'}`}
            >
                <Plus size={18} /> Add Product
            </button>
        </nav>

        <div className="p-4 border-t border-gray-100 flex-shrink-0 space-y-2">
            <button onClick={() => navigate('/')} className="flex items-center justify-center gap-2 text-brand-black px-3 py-2.5 rounded-lg text-sm font-bold bg-white border border-gray-200 hover:bg-gold-50 hover:text-gold-700 w-full transition shadow-sm">
                <Store size={18} /> Visit Live Store
            </button>
            <button onClick={() => setIsAuthenticated(false)} className="flex items-center gap-3 text-red-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-50 w-full transition">
                <LogOut size={18} /> Logout
            </button>
        </div>
      </>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex font-sans">
      
      {/* MOBILE HEADER */}
      <header className="md:hidden fixed top-0 left-0 w-full bg-white z-40 border-b border-gray-200 px-4 py-3 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-2">
             <div className="w-6 h-6"><SanghaviLogo className="w-full h-full text-gold-500" /></div>
             <span className="font-serif font-bold text-gray-900">Admin</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-gray-700">
             <Menu size={24} />
          </button>
      </header>

      {/* MOBILE SIDEBAR (OVERLAY) */}
      {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
              <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)}></div>
              <div className="relative w-64 bg-white h-full shadow-2xl flex flex-col animate-fade-in-up">
                  <div className="absolute top-2 right-2">
                      <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-400 hover:text-black"><X size={20}/></button>
                  </div>
                  <SidebarContent />
              </div>
          </div>
      )}

      {/* DESKTOP SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col fixed h-full z-10 overflow-y-auto">
        <SidebarContent />
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto mt-14 md:mt-0">
        
        {/* VIEW: DASHBOARD */}
        {activeTab === 'dashboard' && (
            <div className="max-w-5xl mx-auto animate-fade-in-up space-y-6 md:space-y-8">
                
                <div className="flex justify-between items-end">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
                        <p className="text-gray-500 text-xs md:text-sm mt-1">Store Overview & Quick Actions</p>
                    </div>
                    {/* Date Pill */}
                    <div className="hidden md:block bg-white px-3 py-1 rounded-full border border-gray-200 text-xs font-bold text-gray-500">
                        {new Date().toLocaleDateString()}
                    </div>
                </div>

                {/* 1. KEY STATS (Clickable Navigation) */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                    <StatCard 
                        title="Total Products" 
                        value={products.length} 
                        icon={Package} 
                        color="bg-blue-500" 
                        onClick={() => setActiveTab('products')} 
                        subtitle="Manage Inventory"
                    />
                    <StatCard 
                        title="Trending Items" 
                        value={trendingProducts.length} 
                        icon={TrendingUp} 
                        color="bg-pink-500" 
                        onClick={() => setActiveTab('trending')}
                        subtitle="Edit Homepage"
                    />
                    <StatCard 
                        title="New Collections" 
                        value={collectionProducts.length} 
                        icon={Crown} 
                        color="bg-orange-500" 
                        onClick={() => setActiveTab('collections')}
                        subtitle="Edit Hero Slider"
                    />
                    <StatCard 
                        title="Active Categories" 
                        value={localCategories.length} 
                        icon={Layers} 
                        color="bg-purple-500" 
                        onClick={() => setActiveTab('categories')}
                        subtitle="Manage Navbar"
                    />
                </div>

                {/* 2. QUICK ACTION GRID (Mobile Priority) */}
                <div>
                    <h3 className="font-bold text-gray-900 mb-3 text-xs md:text-sm uppercase tracking-wide opacity-80">Quick Management</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                        <ActionCard title="Add New Product" icon={Plus} color="bg-green-500" onClick={() => { setFormData(initialFormState); setActiveTab('add'); }} />
                        <ActionCard title="Manage Categories" icon={List} color="bg-blue-500" onClick={() => setActiveTab('categories')} />
                        <ActionCard title="View All Orders" icon={Store} color="bg-purple-500" onClick={() => alert("Orders module coming soon!")} />
                        <ActionCard title="Store Settings" icon={Settings} color="bg-gray-500" onClick={() => alert("Settings module coming soon!")} />
                    </div>
                </div>

                {/* 3. Recent Activity / Hint (Optional) */}
                <div className="bg-gradient-to-r from-brand-black to-gray-800 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-white/10 rounded-full">
                            <Sparkles size={24} className="text-gold-400" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg mb-1">Pro Tip for Mobile</h3>
                            <p className="text-sm text-gray-300 leading-relaxed">
                                You can now fully manage the store from your iPhone. Tap any card above to jump to that section. 
                                Use the menu icon (top-left) to access full navigation.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        )}

        {/* VIEW: TRENDING & COLLECTION MANAGERS (Shared Logic) */}
        {(activeTab === 'trending' || activeTab === 'collections') && (
            <div className="max-w-6xl mx-auto animate-fade-in-up pb-20">
                <div className="mb-6">
                     <button onClick={() => setActiveTab('dashboard')} className="md:hidden flex items-center gap-1 text-gray-500 text-sm font-medium mb-4">
                        <ChevronRight size={16} className="rotate-180"/> Back to Dashboard
                     </button>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {activeTab === 'trending' ? 'Trending Manager' : 'Collection Manager'}
                    </h2>
                    <p className="text-gray-500 text-sm">
                        {activeTab === 'trending' 
                            ? 'Toggle products to show in "Trending Now".'
                            : 'Toggle products to show in Main Hero Slider.'
                        }
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-auto md:h-[600px]">
                    {/* ACTIVE LIST */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[400px] md:h-full">
                        <div className={`p-4 border-b border-gray-100 flex justify-between items-center ${activeTab === 'trending' ? 'bg-pink-50' : 'bg-orange-50'}`}>
                            <h3 className={`font-bold flex items-center gap-2 ${activeTab === 'trending' ? 'text-pink-900' : 'text-orange-900'}`}>
                                {activeTab === 'trending' ? <Megaphone size={18}/> : <Crown size={18}/>} 
                                Active ({activeManagerProducts.length})
                            </h3>
                        </div>
                        <div className="overflow-y-auto p-4 space-y-3 flex-1 scrollbar-hide">
                            {activeManagerProducts.length === 0 ? (
                                <div className="text-center py-20 text-gray-400 flex flex-col items-center">
                                    {activeTab === 'trending' ? <TrendingUp size={48} className="mb-2 opacity-20" /> : <Crown size={48} className="mb-2 opacity-20" />}
                                    <p>No products selected.</p>
                                    <p className="text-xs">Add items from the list below.</p>
                                </div>
                            ) : (
                                activeManagerProducts.map(p => (
                                    <div key={p.id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg hover:shadow-sm transition bg-white animate-fade-in-up">
                                        <div className="w-12 h-12 rounded bg-gray-50 overflow-hidden flex-shrink-0">
                                            <img src={p.image} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-sm text-gray-800 line-clamp-1">{p.name}</h4>
                                            <p className="text-xs text-gray-500">₹{p.price.toLocaleString()}</p>
                                        </div>
                                        <button 
                                            onClick={() => activeTab === 'trending' ? toggleTrending(p, false) : toggleCollection(p, false)}
                                            className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition"
                                            title="Remove"
                                        >
                                            <MinusCircle size={20} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* AVAILABLE LIST */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[500px] md:h-full">
                        <div className="p-4 border-b border-gray-100 bg-gray-50">
                            <h3 className="font-bold text-gray-900 mb-3">Available Products</h3>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input 
                                    type="text" 
                                    placeholder="Search products..." 
                                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-gold-500"
                                    value={managerSearch}
                                    onChange={(e) => setManagerSearch(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="overflow-y-auto p-4 space-y-3 flex-1 scrollbar-hide">
                            {availableManagerProducts.filter(p => p.name.toLowerCase().includes(managerSearch.toLowerCase())).length === 0 ? (
                                <div className="text-center py-10 text-gray-400">No products found.</div>
                            ) : (
                                availableManagerProducts.filter(p => p.name.toLowerCase().includes(managerSearch.toLowerCase())).map(p => (
                                    <div key={p.id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg hover:shadow-sm transition bg-white group animate-fade-in-up">
                                        <div className="w-12 h-12 rounded bg-gray-50 overflow-hidden flex-shrink-0">
                                            <img src={p.image} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-sm text-gray-800 line-clamp-1">{p.name}</h4>
                                            <p className="text-xs text-gray-500">{p.category ? p.category[0] : ''}</p>
                                        </div>
                                        <button 
                                            onClick={() => activeTab === 'trending' ? toggleTrending(p, true) : toggleCollection(p, true)}
                                            className="text-gray-300 hover:text-green-600 hover:bg-green-50 p-2 rounded-full transition"
                                            title="Add"
                                        >
                                            <Plus size={20} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* VIEW: CATEGORY MANAGER */}
        {activeTab === 'categories' && (
             <div className="max-w-6xl mx-auto animate-fade-in-up pb-20">
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                     <div>
                        <button onClick={() => setActiveTab('dashboard')} className="md:hidden flex items-center gap-1 text-gray-500 text-sm font-medium mb-4">
                            <ChevronRight size={16} className="rotate-180"/> Back to Dashboard
                        </button>
                        <h2 className="text-2xl font-bold text-gray-900">Category Manager</h2>
                        <p className="text-gray-500 text-sm mt-1">Drag items to reorder. Manage Navbar & Images.</p>
                     </div>
                     <div className="flex gap-3 w-full md:w-auto">
                        <button onClick={handleSaveOrder} className="flex-1 md:flex-none bg-green-600 text-white px-5 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition shadow-lg text-sm">
                            <Save size={18} /> Save Order
                        </button>
                        <button onClick={() => setModalType('add-cat')} className="flex-1 md:flex-none bg-brand-black text-white px-5 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-gold-600 transition shadow-lg text-sm">
                            <FolderPlus size={18} /> Add Category
                        </button>
                     </div>
                 </div>
                 <div className="space-y-4">
                     {localCategories.map((cat, catIndex) => (
                         <div 
                            key={cat.label} 
                            draggable
                            onDragStart={() => handleDragStart(catIndex)}
                            onDragEnter={() => handleDragEnter(catIndex)}
                            onDragEnd={handleDragEnd}
                            onDragOver={(e) => e.preventDefault()} // Essential for drop
                            className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-200 ${draggedCategoryIndex === catIndex ? 'opacity-40 scale-95 border-gold-500 ring-2 ring-gold-500' : 'hover:shadow-md'}`}
                         >
                             <div className="p-4 bg-gray-50 flex items-center justify-between">
                                 <div className="flex items-center gap-2 md:gap-4 cursor-pointer flex-1 min-w-0">
                                     
                                     {/* MOBILE REORDER CONTROLS (Updated: Always visible on mobile) */}
                                     <div className="flex flex-col md:hidden gap-1 mr-1">
                                         <button 
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); moveCategory(catIndex, 'up'); }}
                                            disabled={catIndex === 0}
                                            className="p-1 text-gray-400 hover:text-gold-600 disabled:opacity-20 active:bg-gray-100 rounded"
                                         >
                                            <ChevronUp size={18} />
                                         </button>
                                         <button 
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); moveCategory(catIndex, 'down'); }}
                                            disabled={catIndex === localCategories.length - 1}
                                            className="p-1 text-gray-400 hover:text-gold-600 disabled:opacity-20 active:bg-gray-100 rounded"
                                         >
                                            <ChevronDown size={18} />
                                         </button>
                                     </div>

                                     {/* DESKTOP DRAG HANDLE */}
                                     <div className="hidden md:block cursor-grab text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-200 rounded" title="Drag to reorder">
                                        <GripVertical size={22} />
                                     </div>

                                     {/* TOGGLE EXPAND */}
                                     <button onClick={() => setCatExpanded(catExpanded === cat.label ? null : cat.label)} className="p-1 rounded hover:bg-gray-200 transition">
                                        {catExpanded === cat.label ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                                     </button>

                                     {/* IMAGE & TITLE */}
                                     <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white border border-gray-200 overflow-hidden relative group shadow-sm flex-shrink-0" onClick={() => setCatExpanded(catExpanded === cat.label ? null : cat.label)}>
                                         <img src={cat.image} className="w-full h-full object-cover" />
                                         <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer text-white transition-opacity" onClick={(e) => e.stopPropagation()}><ImageIcon size={18} /><input type="file" className="hidden" accept="image/*" onClick={(e) => e.stopPropagation()} onChange={(e) => handleImageUpload(e, 'category', catIndex)} /></label>
                                     </div>
                                     <div onClick={() => setCatExpanded(catExpanded === cat.label ? null : cat.label)} className="min-w-0">
                                        <h3 className="font-bold text-sm md:text-lg text-gray-900 truncate">{cat.category}</h3>
                                        <p className="text-[10px] md:text-xs text-gray-500 truncate">{cat.sections.reduce((acc, s) => acc + s.items.length, 0)} sub-items</p>
                                     </div>
                                 </div>
                                 <div className="flex items-center gap-1 md:gap-2">
                                     <button onClick={() => { setTargetIndex({cat: catIndex}); setModalType('rename-cat'); }} className="text-[10px] md:text-xs font-bold text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 md:px-3 py-1.5 rounded transition">Rename</button>
                                     <button onClick={() => { setTargetIndex({cat: catIndex}); setModalType('delete-cat'); }} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"><Trash2 size={16} /></button>
                                 </div>
                             </div>
                             {catExpanded === cat.label && (
                                 <div className="p-4 md:p-6 border-t border-gray-100 bg-white animate-fade-in-up">
                                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                         {cat.sections.map((section, secIndex) => (
                                             <div key={secIndex} className="bg-gray-50 rounded-lg p-4 border border-gray-100 relative group/section">
                                                  <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-200">
                                                     <span className="font-bold text-sm text-gray-700 uppercase tracking-wide">{section.title}</span>
                                                     <button onClick={() => { setTargetIndex({cat: catIndex, sec: secIndex}); setModalType('delete-section'); }} className="text-gray-300 hover:text-red-500 transition opacity-100 md:opacity-0 group-hover/section:opacity-100"><X size={14}/></button>
                                                 </div>
                                                 <ul className="space-y-2 mb-3 max-h-40 overflow-y-auto pr-1 scrollbar-hide">
                                                     {section.items.map((item, itemIndex) => (
                                                         <li key={itemIndex} className="flex justify-between items-center group/item hover:bg-gray-100 p-1.5 rounded transition">
                                                             <span className="text-sm text-gray-600">{item}</span>
                                                             <button onClick={() => { setTargetIndex({cat: catIndex, sec: secIndex, item: itemIndex}); setModalType('delete-item'); }} className="opacity-100 md:opacity-0 group-hover/item:opacity-100 text-gray-400 hover:text-red-500 transition"><Trash2 size={12} /></button>
                                                         </li>
                                                     ))}
                                                 </ul>
                                                 <button onClick={() => { setTargetIndex({cat: catIndex, sec: secIndex}); setModalType('add-item'); }} className="w-full py-2 text-xs font-bold text-gold-600 border border-gold-200 rounded hover:bg-gold-50 transition flex items-center justify-center gap-1"><Plus size={12} /> Add Item</button>
                                             </div>
                                         ))}
                                         <button onClick={() => { setTargetIndex({cat: catIndex}); setModalType('add-section'); }} className="border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center p-6 text-gray-400 hover:border-gold-400 hover:text-gold-600 transition h-full min-h-[150px]"><Layers size={24} className="mb-2" /><span className="font-bold text-sm">Add New Section</span></button>
                                     </div>
                                 </div>
                             )}
                         </div>
                     ))}
                 </div>
             </div>
        )}

        {/* VIEW: FILTER OPTIONS */}
        {activeTab === 'filters' && (
             <div className="max-w-4xl mx-auto animate-fade-in-up pb-20">
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                     <div>
                        <button onClick={() => setActiveTab('dashboard')} className="md:hidden flex items-center gap-1 text-gray-500 text-sm font-medium mb-4">
                            <ChevronRight size={16} className="rotate-180"/> Back to Dashboard
                        </button>
                        <h2 className="text-2xl font-bold text-gray-900">Filter Options</h2>
                        <p className="text-gray-500 text-sm mt-1">Manage the global filters shown on Collections.</p>
                     </div>
                     <div className="flex gap-3 w-full md:w-auto">
                        <button onClick={handleSaveFilterOptions} className="flex-1 md:flex-none bg-brand-black text-white px-5 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-gold-600 transition shadow-lg text-sm">
                            <Save size={18} /> Save Filters
                        </button>
                        <button onClick={resetFilterOptions} className="flex-1 md:flex-none border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition text-sm">
                            <RefreshCw size={18} /> Reset Defaults
                        </button>
                     </div>
                 </div>

                 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                     <div className="space-y-4">
                         {localFilterSections.length === 0 ? (
                             <p className="text-sm text-gray-500">No filter sections configured.</p>
                         ) : (
                             localFilterSections.map((section, sectionIndex) => (
                                 <div key={`${section.title}-${sectionIndex}`} className="border border-gray-100 rounded-lg p-4">
                                     <div className="flex flex-col md:flex-row md:items-center gap-3 mb-3">
                                         <div className="flex flex-col">
                                             <button type="button" onClick={() => moveFilterSection(sectionIndex, 'up')} className="p-1 text-gray-400 hover:text-gold-600" disabled={sectionIndex === 0}>
                                                 <ChevronUp size={16} />
                                             </button>
                                             <button type="button" onClick={() => moveFilterSection(sectionIndex, 'down')} className="p-1 text-gray-400 hover:text-gold-600" disabled={sectionIndex === localFilterSections.length - 1}>
                                                 <ChevronDown size={16} />
                                             </button>
                                         </div>
                                         <input
                                             type="text"
                                             value={section.title}
                                             onChange={(e) => updateFilterSectionTitle(sectionIndex, e.target.value)}
                                             className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-gold-500"
                                             placeholder="Section title"
                                         />
                                         <button type="button" onClick={() => removeFilterSection(sectionIndex)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                                             <Trash2 size={16} />
                                         </button>
                                     </div>
                                     <div className="space-y-2">
                                         {section.items.map((item, itemIndex) => (
                                             <div key={`${section.title}-${itemIndex}`} className="flex items-center gap-2">
                                                 <input
                                                     type="text"
                                                     value={item}
                                                     onChange={(e) => updateFilterItem(sectionIndex, itemIndex, e.target.value)}
                                                     className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-gold-500"
                                                     placeholder="Filter option"
                                                 />
                                                 <button type="button" onClick={() => removeFilterItem(sectionIndex, itemIndex)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                                                     <MinusCircle size={16} />
                                                 </button>
                                             </div>
                                         ))}
                                         <button type="button" onClick={() => addFilterItem(sectionIndex)} className="text-xs font-bold text-gold-600 hover:text-gold-700 flex items-center gap-2">
                                             <Plus size={12} /> Add Option
                                         </button>
                                     </div>
                                 </div>
                             ))
                         )}
                     </div>
                     <div className="flex flex-col md:flex-row gap-3 mt-4">
                         <input
                             type="text"
                             value={newFilterSectionTitle}
                             onChange={(e) => setNewFilterSectionTitle(e.target.value)}
                             placeholder="Add new filter section"
                             className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-gold-500"
                         />
                         <button onClick={addFilterSection} className="bg-gold-500 text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 hover:bg-gold-600 transition">
                             <Plus size={14} /> Add Section
                         </button>
                     </div>
                 </div>
             </div>
        )}

        {/* VIEW: SORT OPTIONS */}
        {activeTab === 'sort' && (
             <div className="max-w-4xl mx-auto animate-fade-in-up pb-20">
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                     <div>
                        <button onClick={() => setActiveTab('dashboard')} className="md:hidden flex items-center gap-1 text-gray-500 text-sm font-medium mb-4">
                            <ChevronRight size={16} className="rotate-180"/> Back to Dashboard
                        </button>
                        <h2 className="text-2xl font-bold text-gray-900">Sort Options</h2>
                        <p className="text-gray-500 text-sm mt-1">Manage the sort order shown on Collections.</p>
                     </div>
                     <div className="flex gap-3 w-full md:w-auto">
                        <button onClick={handleSaveSortOptions} className="flex-1 md:flex-none bg-brand-black text-white px-5 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-gold-600 transition shadow-lg text-sm">
                            <Save size={18} /> Save Sort Options
                        </button>
                        <button onClick={resetSortOptions} className="flex-1 md:flex-none border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition text-sm">
                            <RefreshCw size={18} /> Reset Defaults
                        </button>
                     </div>
                 </div>

                 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                     <div className="space-y-3">
                         {localSortOptions.length === 0 ? (
                             <p className="text-sm text-gray-500">No sort options configured.</p>
                         ) : (
                             localSortOptions.map((option, idx) => (
                                 <div key={`${option}-${idx}`} className="flex items-center gap-3 p-2 rounded-lg border border-gray-100">
                                     <div className="flex flex-col">
                                         <button type="button" onClick={() => moveSortOption(idx, 'up')} className="p-1 text-gray-400 hover:text-gold-600" disabled={idx === 0}>
                                             <ChevronUp size={16} />
                                         </button>
                                         <button type="button" onClick={() => moveSortOption(idx, 'down')} className="p-1 text-gray-400 hover:text-gold-600" disabled={idx === localSortOptions.length - 1}>
                                             <ChevronDown size={16} />
                                         </button>
                                     </div>
                                     <input
                                         type="text"
                                         value={option}
                                         onChange={(e) => updateSortOption(idx, e.target.value)}
                                         className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-gold-500"
                                         placeholder="Sort option label"
                                     />
                                     <button type="button" onClick={() => removeSortOption(idx)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                                         <Trash2 size={16} />
                                     </button>
                                 </div>
                             ))
                         )}
                     </div>
                     <div className="flex flex-col md:flex-row gap-3 mt-4">
                         <input
                             type="text"
                             value={newSortOption}
                             onChange={(e) => setNewSortOption(e.target.value)}
                             placeholder="Add new sort option"
                             className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-gold-500"
                         />
                         <button onClick={addSortOption} className="bg-gold-500 text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 hover:bg-gold-600 transition">
                             <Plus size={14} /> Add Option
                         </button>
                     </div>
                 </div>
             </div>
        )}

        {/* VIEW: PRODUCT LIST */}
        {activeTab === 'products' && (
            <div className="max-w-6xl mx-auto animate-fade-in-up pb-20">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <button onClick={() => setActiveTab('dashboard')} className="md:hidden flex items-center gap-1 text-gray-500 text-sm font-medium mb-4">
                            <ChevronRight size={16} className="rotate-180"/> Back to Dashboard
                        </button>
                        <h2 className="text-2xl font-bold text-gray-900">Products</h2>
                    </div>
                                        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
                                                <button onClick={smartSyncAllTags} className="w-full md:w-auto border border-brand-black text-brand-black px-4 py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-brand-black hover:text-white transition">
                                                    <Sparkles size={16} /> Smart Sync All
                                                </button>
                                                <button onClick={autoTagMissingSubcategories} className="w-full md:w-auto border border-gray-300 text-gray-800 px-4 py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:border-gold-500 hover:text-gold-700 hover:bg-gold-50 transition">
                                                    Auto-Tag Missing
                                                </button>
                                                <button onClick={() => { setFormData(initialFormState); setActiveTab('add'); }} className="w-full md:w-auto bg-brand-black text-white px-4 py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-gold-600 transition shadow-md"><Plus size={16} /> Add Product</button>
                                        </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6 flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input type="text" placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gold-500" />
                    </div>
                    <select value={selectedCategoryFilter} onChange={(e) => setSelectedCategoryFilter(e.target.value)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-900 focus:outline-none focus:border-gold-500">
                        <option value="All">All Categories</option>
                        {localCategories.map(cat => <option key={cat.label} value={cat.category}>{cat.category}</option>)}
                    </select>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr className="text-xs text-gray-500 uppercase tracking-wider">
                                <th className="px-6 py-4 font-bold">Product</th>
                                <th className="px-6 py-4 font-bold hidden md:table-cell">Category</th>
                                <th className="px-6 py-4 font-bold">Price</th>
                                <th className="px-6 py-4 font-bold hidden md:table-cell">Status</th>
                                <th className="px-6 py-4 font-bold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredProducts.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">No products found matching your filters.</td></tr>
                            ) : (
                                filteredProducts.map(product => (
                                    <tr key={product.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4"><div className="flex items-center gap-4"><div className="w-12 h-12 rounded bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-200"><img src={product.image} className="w-full h-full object-cover" /></div><div><p className="font-bold text-gray-900 text-sm line-clamp-1">{product.name}</p></div></div></td>
                                        <td className="px-6 py-4 text-sm text-gray-600 hidden md:table-cell"><span className="block font-medium">{product.category ? product.category[0] : ''}</span>{product.subcategory && <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{product.subcategory}</span>}</td>
                                        <td className="px-6 py-4 text-sm font-medium">₹{product.price.toLocaleString('en-IN')}</td>
                                        <td className="px-6 py-4 hidden md:table-cell">
                                            <div className="flex gap-2">
                                                {product.inStock ? <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-50 text-green-700">In Stock</span> : <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-600">Sold Out</span>}
                                                {product.isTrending && <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-pink-50 text-pink-700">Trending</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => applySuggestedTags(product)} className="p-2 text-gray-400 hover:text-gold-600 hover:bg-gold-50 rounded transition" title="Apply smart tags">
                                                    <Sparkles size={16} />
                                                </button>
                                                <button onClick={() => startEdit(product)} className="p-2 text-gray-400 hover:text-brand-black hover:bg-gray-200 rounded transition">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button onClick={() => handleDeleteProduct(product.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                    </div>
                </div>
            </div>
        )}

        {/* VIEW: ADD / EDIT PRODUCT FORM */}
        {(activeTab === 'add' || activeTab === 'edit') && (
            <div className="max-w-5xl mx-auto animate-fade-in-up pb-20">
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => setActiveTab('products')} className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition"><ChevronRight size={24} className="rotate-180" /></button>
                    <h2 className="text-2xl font-bold text-gray-900">{activeTab === 'add' ? 'Add New Product' : 'Edit Product'}</h2>
                </div>

                <form onSubmit={handleProductSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* LEFT COLUMN - MAIN INFO */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Details */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">Basic Details</h3>
                            <div className="space-y-4">
                                <div><label className="block text-sm font-medium text-gray-900 mb-1">Product Title</label><input type="text" required className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none text-gray-900" placeholder="e.g. 22kt Gold Antique Necklace" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
                                <div><label className="block text-sm font-medium text-gray-900 mb-1">Description</label><textarea className="w-full border border-gray-300 p-2.5 rounded-lg h-32 focus:ring-2 focus:ring-gold-500 outline-none text-gray-900" placeholder="Detailed description of the product..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea></div>
                            </div>
                        </div>

                        {/* Media (Multiple Images) */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <div className="flex justify-between items-center mb-4 border-b pb-2">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Product Gallery</h3>
                                <span className="text-xs text-gray-500">{(formData.images || []).length} Images</span>
                            </div>
                            
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                                {/* Upload Button */}
                                <label className={`aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-gold-500 hover:bg-gold-50 transition flex flex-col items-center justify-center cursor-pointer ${imageUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    <input type="file" accept="image/*" multiple onChange={(e) => handleImageUpload(e, 'product')} className="hidden" disabled={imageUploading} />
                                        {imageUploading ? <Loader className="animate-spin text-gold-600" /> : <UploadCloud className="text-gray-400" />}
                                        <span className="text-xs font-bold text-gray-500 mt-2">Upload</span>
                                    </label>

                                {/* Image Previews */}
                                {(formData.images || []).map((img, idx) => (
                                    <div key={idx} className="aspect-square rounded-lg border border-gray-200 relative group overflow-hidden bg-gray-50">
                                        <img src={img} className="w-full h-full object-cover" />
                                        <button type="button" onClick={() => removeProductImage(idx)} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition shadow-sm"><X size={12} /></button>
                                        {idx === 0 && <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[9px] font-bold text-center py-1">COVER</span>}
                                    </div>
                                ))}
                            </div>
                            
                            <div className="border-t border-gray-100 pt-4">
                                <label className="block text-xs font-bold text-gray-900 uppercase mb-2">Or Paste Image Link (Single)</label>
                                <input ref={urlInputRef} type="url" placeholder="https://..." className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-gold-500 outline-none text-gray-900" 
                                    onBlur={(e) => {
                                        if (e.target.value) {
                                            setFormData(prev => ({ 
                                                ...prev, 
                                                images: [...(prev.images || []), e.target.value],
                                                image: prev.image || e.target.value
                                            }));
                                            e.target.value = '';
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        {/* Media (Videos) */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <div className="flex justify-between items-center mb-4 border-b pb-2">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Product Videos</h3>
                                <span className="text-xs text-gray-500">{(formData.videos || []).length} Videos</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                <label className={`h-32 rounded-lg border-2 border-dashed border-gray-300 hover:border-gold-500 hover:bg-gold-50 transition flex flex-col items-center justify-center cursor-pointer ${videoUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    <input type="file" accept="video/*" multiple onChange={handleVideoUpload} className="hidden" disabled={videoUploading} />
                                    {videoUploading ? <Loader className="animate-spin text-gold-600" /> : <UploadCloud className="text-gray-400" />}
                                    <span className="text-xs font-bold text-gray-500 mt-2">Upload Video</span>
                                </label>

                                {(formData.videos || []).map((videoUrl, idx) => (
                                    <div key={idx} className="h-32 rounded-lg border border-gray-200 relative group overflow-hidden bg-gray-50">
                                        <video src={videoUrl} className="w-full h-full object-cover" controls />
                                        <button type="button" onClick={() => removeProductVideo(idx)} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition shadow-sm"><X size={12} /></button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Pricing - UPDATED FOR OPTIONALITY */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">Pricing (Optional)</h3>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-900 mb-1">Selling Price (₹)</label>
                                        <input 
                                            type="number" 
                                            className="w-full border border-gray-300 p-2.5 rounded-lg font-bold text-lg text-gray-900 placeholder-gray-300" 
                                            value={formData.price === 0 ? '' : formData.price} 
                                            onChange={e => setFormData({...formData, price: Number(e.target.value)})} 
                                            placeholder="Leave empty if none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-900 mb-1">MRP / Compare Price (₹)</label>
                                        <input 
                                            type="number" 
                                            className="w-full border border-gray-300 p-2.5 rounded-lg text-gray-900 placeholder-gray-300" 
                                            value={!formData.originalPrice ? '' : formData.originalPrice} 
                                            onChange={e => setFormData({...formData, originalPrice: Number(e.target.value)})} 
                                            placeholder="Optional"
                                        />
                                    </div>
                                </div>
                                
                                {/* Hide Price Toggle - RENAMED FOR CLARITY */}
                                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 transition">
                                    <input 
                                        type="checkbox" 
                                        checked={formData.priceOnRequest} 
                                        onChange={e => setFormData({...formData, priceOnRequest: e.target.checked})} 
                                        className="w-5 h-5 accent-brand-black rounded" 
                                    />
                                    <div className="flex-1">
                                        <span className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                            <Type size={16} /> Display "Price on Request" Label?
                                        </span>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            If checked, "Price on Request" will be shown. If unchecked and price is 0, nothing will be shown.
                                        </p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* SMART SPECIFICATIONS (Updated Defaults) */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <div className="flex justify-between items-center mb-4 border-b pb-2">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Specifications</h3>
                                <div className="flex gap-3">
                                    <button type="button" onClick={resetSpecsToDefault} className="text-xs font-bold text-gray-400 hover:text-gray-600 flex items-center gap-1"><RefreshCw size={12}/> Reset Defaults</button>
                                    <button type="button" onClick={addSpecRow} className="text-xs font-bold text-gold-600 hover:text-gold-700 flex items-center gap-1">+ Add Field</button>
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                {(formData.specifications || []).map((spec, idx) => (
                                    <div key={idx} className="flex gap-3 items-center group">
                                        <div className="w-1/3 relative">
                                            {/* Key Input - Editable */}
                                            <input 
                                                type="text" 
                                                placeholder="Key" 
                                                className="w-full border border-gray-300 p-2 rounded text-sm font-bold bg-gray-50 focus:bg-white text-gray-900 transition"
                                                value={spec.key}
                                                onChange={(e) => handleSpecChange(idx, 'key', e.target.value)}
                                            />
                                        </div>
                                        <div className="flex-1 relative">
                                            {/* Value Input */}
                                            <input 
                                                type="text" 
                                                placeholder="Value (e.g. 6g)" 
                                                className="w-full border border-gray-300 p-2 rounded text-sm focus:ring-1 focus:ring-gold-500 text-gray-900 bg-white"
                                                value={spec.value}
                                                onChange={(e) => handleSpecChange(idx, 'value', e.target.value)}
                                            />
                                        </div>
                                        <button type="button" onClick={() => removeSpecRow(idx)} className="text-gray-300 hover:text-red-500 p-1">
                                            <MinusCircle size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 text-xs text-gray-400 bg-gray-50 p-2 rounded">
                                <span className="font-bold">Note:</span> Standard fields (Material, Purity, Weights) are pre-filled. You can rename keys (e.g., change "Gross Weight" to "Total Weight") or add new ones.
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN - ORGANIZATION */}
                    <div className="space-y-6">
                        {/* PRODUCT ORGANIZATION */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">Organization</h3>
                            <div className="space-y-6">
                                <div><label className="block text-sm font-bold text-gray-800 mb-2">Main Category</label><select className="w-full border border-gray-300 p-3 rounded-lg bg-gray-50 text-gray-900 focus:ring-2 focus:ring-gold-500 outline-none font-medium" value={(formData.category && formData.category[0]) || ''} onChange={e => setFormData({...formData, category: [e.target.value], subcategory: ''})}><option value="" disabled>Select Category</option>{localCategories.map(c => <option key={c.label} value={c.category}>{c.category}</option>)}</select></div>
                                
                                {activeCategoryConfig && activeCategoryConfig.sections.length > 0 && (
                                    <div className="space-y-4 border-t border-gray-100 pt-4"><p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Attributes & Filters</p>{activeCategoryConfig.sections.map((section) => (<div key={section.title}><label className="block text-xs font-bold text-gray-500 mb-2">{section.title}</label><div className="flex flex-wrap gap-2">{section.items.map(item => { const isSelected = formData.category.includes(item); return (<button type="button" key={item} onClick={() => toggleAttribute(item)} className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-all ${isSelected ? 'bg-gold-500 text-white border-gold-500 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-gold-300'}`}>{item}{isSelected && <span className="ml-1">✓</span>}</button>); })}</div></div>))}</div>
                                )}
                            </div>
                        </div>

                        {/* VISIBILITY & PROMOTION */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">Visibility & Promotion</h3>
                            <div className="space-y-3">
                                <label className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-gray-50">
                                    <input type="checkbox" checked={formData.inStock} onChange={e => setFormData({...formData, inStock: e.target.checked})} className="w-5 h-5 accent-green-600 rounded" />
                                    <span className="text-sm font-medium text-gray-700">In Stock</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-gray-50">
                                    <input type="checkbox" checked={formData.isNew} onChange={e => setFormData({...formData, isNew: e.target.checked})} className="w-5 h-5 accent-blue-600 rounded" />
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-gray-700">Mark as New Arrival</span>
                                        <span className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.5 rounded font-bold">NEW</span>
                                    </div>
                                </label>
                                
                                {/* New Collection Slider Option */}
                                <label className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-gray-50 bg-orange-50 border border-orange-100">
                                    <input type="checkbox" checked={formData.isFeaturedCollection} onChange={e => setFormData({...formData, isFeaturedCollection: e.target.checked})} className="w-5 h-5 accent-orange-600 rounded" />
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-orange-900">Show in "New Collection" (Top Slider)</span>
                                        <Crown size={14} className="text-orange-600" />
                                    </div>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-gray-50 bg-pink-50 border border-pink-100">
                                    <input type="checkbox" checked={formData.isTrending} onChange={e => setFormData({...formData, isTrending: e.target.checked})} className="w-5 h-5 accent-pink-600 rounded" />
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-pink-900">Show on Trending (Homepage)</span>
                                        <TrendingUp size={14} className="text-pink-600" />
                                    </div>
                                </label>
                            </div>
                        </div>

                        <button type="submit" disabled={uploading} className="w-full bg-brand-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gold-600 transition shadow-lg flex items-center justify-center gap-2">
                            <Save size={20} /> {activeTab === 'add' ? 'Publish Product' : 'Update Product'}
                        </button>
                    </div>
                </form>
            </div>
        )}

      </main>

      {/* --- MODALS --- (Existing Modals) */}
      <InputModal isOpen={modalType === 'add-cat'} onClose={() => setModalType('none')} onConfirm={handleModalConfirm} title="Add Main Category" label="New Category Name" placeholder="e.g. Diamond Jewellery" confirmText="Create Category" />
      <InputModal isOpen={modalType === 'rename-cat'} onClose={() => setModalType('none')} onConfirm={handleModalConfirm} title="Rename Category" label="New Name" initialValue={targetIndex ? localCategories[targetIndex.cat].category : ''} placeholder="Category Name" confirmText="Update Name" />
      <InputModal isOpen={modalType === 'add-section'} onClose={() => setModalType('none')} onConfirm={handleModalConfirm} title="Add New Section" label="Section Title" placeholder="e.g. By Occasion" confirmText="Add Section" />
      <InputModal isOpen={modalType === 'add-item'} onClose={() => setModalType('none')} onConfirm={handleModalConfirm} title="Add Subcategory Item" label="Item Name" placeholder="e.g. Chokers" confirmText="Add Item" />
      <ConfirmModal isOpen={modalType === 'delete-cat'} onClose={() => setModalType('none')} onConfirm={handleModalConfirm} title="Delete Category?" message={`Are you sure you want to delete "${targetIndex ? localCategories[targetIndex.cat].category : ''}"?`} danger />
      <ConfirmModal isOpen={modalType === 'delete-section'} onClose={() => setModalType('none')} onConfirm={handleModalConfirm} title="Delete Section?" message="This will remove the section and all its items." danger />
      <ConfirmModal isOpen={modalType === 'delete-item'} onClose={() => setModalType('none')} onConfirm={handleModalConfirm} title="Remove Item?" message="Are you sure you want to remove this subcategory?" danger />

    </div>
  );
};

export default AdminPage;