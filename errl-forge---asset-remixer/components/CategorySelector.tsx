import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MapleCategory } from '../types';
import { mainCategories, itemSubcategories, characterSubcategories, equipSubcategories, mapSubcategories } from '../constants/categories';
import { useSubcategoryScroll } from '../hooks/useSubcategoryScroll';

interface CategorySelectorProps {
  activeCategory: MapleCategory;
  selectedMapSubcategory?: string;
  onCategoryChange: (category: MapleCategory) => void;
  onMapSubcategoryChange?: (subcategoryId: string, searchQuery: string) => void;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  activeCategory,
  selectedMapSubcategory,
  onCategoryChange,
  onMapSubcategoryChange
}) => {
  const [showItemSubcategories, setShowItemSubcategories] = useState(activeCategory === 'item' || itemSubcategories.some(sub => sub.id === activeCategory));
  const [showEquipSubcategories, setShowEquipSubcategories] = useState(activeCategory === 'equip' || equipSubcategories.some(sub => sub.id === activeCategory));
  const [showCharacterSubcategories, setShowCharacterSubcategories] = useState(activeCategory === 'character' || characterSubcategories.some(sub => sub.id === activeCategory));
  const [showMapSubcategories, setShowMapSubcategories] = useState(activeCategory === 'map');

  const { scrollRef: categoryScrollRef, showArrows: showCategoryArrows } = useSubcategoryScroll([activeCategory]);
  const { scrollRef: itemSubcategoryScrollRef, showArrows: showItemSubcategoryArrows } = useSubcategoryScroll([showItemSubcategories, activeCategory]);
  const { scrollRef: equipSubcategoryScrollRef, showArrows: showEquipSubcategoryArrows } = useSubcategoryScroll([showEquipSubcategories, activeCategory]);
  const { scrollRef: mapSubcategoryScrollRef, showArrows: showMapSubcategoryArrows } = useSubcategoryScroll([showMapSubcategories, selectedMapSubcategory]);

  // Update subcategory visibility when activeCategory changes
  useEffect(() => {
    setShowItemSubcategories(activeCategory === 'item' || itemSubcategories.some(sub => sub.id === activeCategory));
    setShowEquipSubcategories(activeCategory === 'equip' || equipSubcategories.some(sub => sub.id === activeCategory));
    setShowCharacterSubcategories(activeCategory === 'character' || characterSubcategories.some(sub => sub.id === activeCategory));
    setShowMapSubcategories(activeCategory === 'map');
  }, [activeCategory]);

  const handleMainCategoryClick = (catId: MapleCategory) => {
    onCategoryChange(catId);
    setShowItemSubcategories(catId === 'item');
    setShowEquipSubcategories(catId === 'equip');
    setShowCharacterSubcategories(catId === 'character');
    setShowMapSubcategories(catId === 'map');
  };

  return (
    <div className="bg-gray-900 border-b border-gray-800 shrink-0 relative">
      {/* Main Categories */}
      {/* Left Arrow */}
      <div 
        className={`absolute left-0 top-0 bottom-0 flex items-center z-10 pointer-events-none transition-opacity duration-200 ${
          showCategoryArrows.left ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <ChevronLeft className="w-5 h-5 text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
      </div>
      
      {/* Right Arrow */}
      <div 
        className={`absolute right-0 top-0 bottom-0 flex items-center z-10 pointer-events-none transition-opacity duration-200 ${
          showCategoryArrows.right ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <ChevronRight className="w-5 h-5 text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
      </div>
      
      <div 
        ref={categoryScrollRef}
        className="flex p-2 gap-1 overflow-x-auto scrollbar-hide"
      >
        {mainCategories.map(cat => (
          <button
            key={cat.id}
            onClick={() => handleMainCategoryClick(cat.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded text-[10px] font-bold uppercase whitespace-nowrap transition-all ${
              activeCategory === cat.id || (cat.id === 'item' && itemSubcategories.some(sub => sub.id === activeCategory)) || (cat.id === 'equip' && equipSubcategories.some(sub => sub.id === activeCategory)) || (cat.id === 'character' && characterSubcategories.some(sub => sub.id === activeCategory))
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <cat.icon className="w-3 h-3" />
            {cat.label}
          </button>
        ))}
      </div>
      
      {/* Item Subcategories */}
      {showItemSubcategories && (
        <div className="relative border-t border-gray-800/50">
          {/* Left Arrow */}
          <div 
            className={`absolute left-0 top-0 bottom-0 flex items-center z-10 pointer-events-none transition-opacity duration-200 ${
              showItemSubcategoryArrows.left ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <ChevronLeft className="w-4 h-4 text-indigo-400 drop-shadow-[0_0_6px_rgba(99,102,241,0.8)]" />
          </div>
          
          {/* Right Arrow */}
          <div 
            className={`absolute right-0 top-0 bottom-0 flex items-center z-10 pointer-events-none transition-opacity duration-200 ${
              showItemSubcategoryArrows.right ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <ChevronRight className="w-4 h-4 text-indigo-400 drop-shadow-[0_0_6px_rgba(99,102,241,0.8)]" />
          </div>
          
          <div 
            ref={itemSubcategoryScrollRef}
            className="flex p-2 pt-0 gap-1 overflow-x-auto scrollbar-hide"
          >
            {itemSubcategories.map(cat => (
              <button
                key={cat.id}
                onClick={() => onCategoryChange(cat.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[9px] font-bold uppercase whitespace-nowrap transition-all ${
                  activeCategory === cat.id
                  ? 'bg-indigo-600/80 text-white shadow-md shadow-indigo-500/10' 
                  : 'bg-gray-800/50 text-gray-500 hover:bg-gray-700/50 hover:text-gray-300'
                }`}
              >
                <cat.icon className="w-2.5 h-2.5" />
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Equip Subcategories */}
      {showEquipSubcategories && (
        <div className="relative border-t border-gray-800/50">
          {/* Left Arrow */}
          <div 
            className={`absolute left-0 top-0 bottom-0 flex items-center z-10 pointer-events-none transition-opacity duration-200 ${
              showEquipSubcategoryArrows.left ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <ChevronLeft className="w-4 h-4 text-indigo-400 drop-shadow-[0_0_6px_rgba(99,102,241,0.8)]" />
          </div>
          
          {/* Right Arrow */}
          <div 
            className={`absolute right-0 top-0 bottom-0 flex items-center z-10 pointer-events-none transition-opacity duration-200 ${
              showEquipSubcategoryArrows.right ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <ChevronRight className="w-4 h-4 text-indigo-400 drop-shadow-[0_0_6px_rgba(99,102,241,0.8)]" />
          </div>
          
          <div 
            ref={equipSubcategoryScrollRef}
            className="flex p-2 pt-0 gap-1 overflow-x-auto scrollbar-hide"
          >
            {equipSubcategories.map(cat => (
              <button
                key={cat.id}
                onClick={() => onCategoryChange(cat.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[9px] font-bold uppercase whitespace-nowrap transition-all ${
                  activeCategory === cat.id
                  ? 'bg-indigo-600/80 text-white shadow-md shadow-indigo-500/10' 
                  : 'bg-gray-800/50 text-gray-500 hover:bg-gray-700/50 hover:text-gray-300'
                }`}
              >
                <cat.icon className="w-2.5 h-2.5" />
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Character Subcategories */}
      {showCharacterSubcategories && (
        <div className="relative border-t border-gray-800/50">
          <div 
            className="flex p-2 pt-0 gap-1 overflow-x-auto scrollbar-hide"
          >
            {characterSubcategories.map(cat => (
              <button
                key={cat.id}
                onClick={() => onCategoryChange(cat.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[9px] font-bold uppercase whitespace-nowrap transition-all ${
                  activeCategory === cat.id
                  ? 'bg-indigo-600/80 text-white shadow-md shadow-indigo-500/10' 
                  : 'bg-gray-800/50 text-gray-500 hover:bg-gray-700/50 hover:text-gray-300'
                }`}
              >
                <cat.icon className="w-2.5 h-2.5" />
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Map Subcategories (Towns) */}
      {showMapSubcategories && onMapSubcategoryChange && (
        <div className="relative border-t border-gray-800/50">
          {/* Left Arrow */}
          <div 
            className={`absolute left-0 top-0 bottom-0 flex items-center z-10 pointer-events-none transition-opacity duration-200 ${
              showMapSubcategoryArrows.left ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <ChevronLeft className="w-4 h-4 text-indigo-400 drop-shadow-[0_0_6px_rgba(99,102,241,0.8)]" />
          </div>
          
          {/* Right Arrow */}
          <div 
            className={`absolute right-0 top-0 bottom-0 flex items-center z-10 pointer-events-none transition-opacity duration-200 ${
              showMapSubcategoryArrows.right ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <ChevronRight className="w-4 h-4 text-indigo-400 drop-shadow-[0_0_6px_rgba(99,102,241,0.8)]" />
          </div>
          
          <div 
            ref={mapSubcategoryScrollRef}
            className="flex p-2 pt-0 gap-1 overflow-x-auto scrollbar-hide"
          >
            {mapSubcategories.map(town => (
              <button
                key={town.id}
                onClick={() => onMapSubcategoryChange(town.id, town.searchQuery)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[9px] font-bold uppercase whitespace-nowrap transition-all ${
                  selectedMapSubcategory === town.id
                  ? 'bg-indigo-600/80 text-white shadow-md shadow-indigo-500/10' 
                  : 'bg-gray-800/50 text-gray-500 hover:bg-gray-700/50 hover:text-gray-300'
                }`}
              >
                <town.icon className="w-2.5 h-2.5" />
                {town.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

