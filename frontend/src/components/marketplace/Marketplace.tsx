'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import {
  ShoppingCartIcon,
  StarIcon,
  HeartIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  TruckIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

interface MarketplaceProduct {
  id: string;
  name: string;
  description?: string;
  category: string;
  subcategory?: string;
  price: number;
  currency: string;
  discountPrice?: number;
  isOnSale: boolean;
  vendorName: string;
  stock: number;
  images?: string[];
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  tags?: string[];
}

interface MarketplaceProps {
  onProductClick?: (product: MarketplaceProduct) => void;
}

export default function Marketplace({ onProductClick }: MarketplaceProps) {
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<MarketplaceProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [cart, setCart] = useState<MarketplaceProduct[]>([]);

  const categories = [
    { id: '', name: 'All Categories' },
    { id: 'HEALTH_TEST', name: 'Health Tests' },
    { id: 'SUPPLEMENTS', name: 'Supplements' },
    { id: 'MEDICAL_DEVICES', name: 'Medical Devices' },
    { id: 'WELLNESS', name: 'Wellness Products' }
  ];

  const sortOptions = [
    { id: 'featured', name: 'Featured' },
    { id: 'price_low', name: 'Price: Low to High' },
    { id: 'price_high', name: 'Price: High to Low' },
    { id: 'rating', name: 'Highest Rated' },
    { id: 'newest', name: 'Newest' }
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchQuery, selectedCategory, sortBy]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/marketplace/products');
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price_low':
          return a.price - b.price;
        case 'price_high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'newest':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case 'featured':
        default:
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          return b.rating - a.rating;
      }
    });

    setFilteredProducts(filtered);
  };

  const addToCart = (product: MarketplaceProduct) => {
    setCart(prev => [...prev, product]);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'HEALTH_TEST':
        return '🧪';
      case 'SUPPLEMENTS':
        return '💊';
      case 'MEDICAL_DEVICES':
        return '🩺';
      case 'WELLNESS':
        return '🧘';
      default:
        return '🛍️';
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: currency
    }).format(price);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Health & Wellness Marketplace
        </h1>
        <p className="text-gray-600">
          Discover quality health products and wellness solutions
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {sortOptions.map(option => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Cart Summary */}
      {cart.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShoppingCartIcon className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-900">
                  {cart.length} item(s) in cart
                </span>
              </div>
              <div className="text-sm text-green-700">
                Total: {formatPrice(
                  cart.reduce((sum, item) => sum + item.price, 0),
                  'ZAR'
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              {/* Product Image */}
              <div className="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="text-4xl">{getCategoryIcon(product.category)}</div>
                )}
                
                {product.isFeatured && (
                  <Badge variant="warning" className="absolute top-2 right-2">
                    Featured
                  </Badge>
                )}
                
                {product.isOnSale && (
                  <Badge variant="danger" className="absolute top-2 left-2">
                    Sale
                  </Badge>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900 line-clamp-2">
                  {product.name}
                </h3>
                
                <p className="text-sm text-gray-600 line-clamp-2">
                  {product.description}
                </p>
                
                <div className="flex items-center space-x-1">
                  {renderStars(product.rating)}
                  <span className="text-sm text-gray-600">
                    ({product.reviewCount})
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {product.isOnSale && product.discountPrice ? (
                      <>
                        <span className="font-bold text-primary-600">
                          {formatPrice(product.discountPrice, product.currency)}
                        </span>
                        <span className="text-sm text-gray-500 line-through">
                          {formatPrice(product.price, product.currency)}
                        </span>
                      </>
                    ) : (
                      <span className="font-bold text-primary-600">
                        {formatPrice(product.price, product.currency)}
                      </span>
                    )}
                  </div>
                  
                  <Badge variant="secondary" className="text-xs">
                    {product.vendorName}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Stock: {product.stock}</span>
                  <span className="flex items-center space-x-1">
                    <TruckIcon className="w-4 h-4" />
                    <span>Free shipping</span>
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 space-y-2">
                <Button
                  onClick={() => onProductClick?.(product)}
                  className="w-full"
                  size="sm"
                >
                  View Details
                </Button>
                
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => addToCart(product)}
                    disabled={product.stock === 0}
                    className="flex-1"
                    size="sm"
                  >
                    <ShoppingCartIcon className="w-4 h-4 mr-1" />
                    Add to Cart
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="px-2"
                  >
                    <HeartIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Products */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No products found
          </h3>
          <p className="text-gray-500">
            Try adjusting your search criteria or browse all categories
          </p>
        </div>
      )}

      {/* Trust Indicators */}
      <Card className="border-gray-200">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center space-y-2">
              <ShieldCheckIcon className="w-8 h-8 text-green-500" />
              <h4 className="font-medium text-gray-900">Secure Payment</h4>
              <p className="text-sm text-gray-600">
                All transactions are encrypted and secure
              </p>
            </div>
            
            <div className="flex flex-col items-center space-y-2">
              <TruckIcon className="w-8 h-8 text-blue-500" />
              <h4 className="font-medium text-gray-900">Free Shipping</h4>
              <p className="text-sm text-gray-600">
                Free delivery on orders over R500
              </p>
            </div>
            
            <div className="flex flex-col items-center space-y-2">
              <StarIcon className="w-8 h-8 text-yellow-500" />
              <h4 className="font-medium text-gray-900">Quality Guaranteed</h4>
              <p className="text-sm text-gray-600">
                Verified products from trusted vendors
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

