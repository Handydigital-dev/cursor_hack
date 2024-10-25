"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Checkbox } from "@/app/components/ui/checkbox";
import { useState, useEffect } from "react";
import { getRecipes } from "@/app/lib/api"; // 新しい関数をインポート

interface Food {
  id: string;
  name: string;
  expiration_date: string;
}

interface Recipe {
  name: string;
  cooking_time: string;
  difficulty: string;
  ingredients: string[];
  steps: string[];
  tips?: string;
}

interface RecipeModalProps {
  foods: Food[];  // 全ての食品データを受け取る
  isOpen: boolean;
  onClose: () => void;
}

export function RecipeModal({ foods, isOpen, onClose }: RecipeModalProps) {
  const [selectedFoods, setSelectedFoods] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);

  // 残り日数を計算する関数
  const calculateDaysLeft = (expirationDate: string) => {
    const today = new Date();
    const expDate = new Date(expirationDate);
    const timeDiff = expDate.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };

  // 食品を賞味期限の残り日数で並べ替え
  const sortedFoods = foods.sort((a, b) => 
    calculateDaysLeft(a.expiration_date) - calculateDaysLeft(b.expiration_date)
  ).slice(0, 10);

  const handleFoodSelect = (foodId: string) => {
    setSelectedFoods(prev => {
      if (prev.includes(foodId)) {
        return prev.filter(id => id !== foodId);
      }
      if (prev.length >= 4) {
        return prev;
      }
      return [...prev, foodId];
    });
  };

  const fetchRecipes = async () => {
    if (selectedFoods.length === 0) return;

    setLoading(true);
    try {
      const selectedFoodItems = foods.filter(food => selectedFoods.includes(food.id));
      const ingredients = selectedFoodItems.map(food => food.name);

      const data = await getRecipes(ingredients);
      setRecipes(data.recipes);
    } catch (error) {
      console.error('レシピの取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  // モーダルが閉じられたときに状態をリセット
  useEffect(() => {
    if (!isOpen) {
      setSelectedFoods([]);
      setRecipes([]);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>賞味期限が近い食材でレシピを作る</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">食材を選択（最大4つまで）</h3>
            <div className="space-y-2">
              {sortedFoods.map((food) => {
                const daysLeft = calculateDaysLeft(food.expiration_date);
                const isExpired = daysLeft < 0;
                return (
                  <div key={food.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={food.id}
                      checked={selectedFoods.includes(food.id)}
                      onCheckedChange={() => handleFoodSelect(food.id)}
                      disabled={!selectedFoods.includes(food.id) && selectedFoods.length >= 4}
                    />
                    <label htmlFor={food.id} className="text-sm">
                      {food.name}
                      <span className={`ml-2 ${isExpired ? 'text-red-500' : 'text-gray-500'}`}>
                        {isExpired ? '（賞味期限切れ）' : `（残り${daysLeft}日）`}
                      </span>
                    </label>
                  </div>
                );
              })}
            </div>
          </div>

          {selectedFoods.length > 0 && (
            <Button
              onClick={fetchRecipes}
              disabled={loading}
              className="w-full mb-4 bg-orange-500 hover:bg-orange-600 text-white"
            >
              レシピを取得
            </Button>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {recipes.map((recipe, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-2">{recipe.name}</h3>
                  <div className="flex gap-4 text-sm text-gray-600 mb-3">
                    <span>調理時間: {recipe.cooking_time}</span>
                    <span>難易度: {recipe.difficulty}</span>
                  </div>
                  <div className="mb-3">
                    <h4 className="font-medium mb-1">材料:</h4>
                    <ul className="list-disc list-inside">
                      {recipe.ingredients.map((ingredient, i) => (
                        <li key={i}>{ingredient}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">手順:</h4>
                    <ol className="list-decimal list-inside">
                      {recipe.steps.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ol>
                  </div>
                  {recipe.tips && (
                    <div className="mt-3 text-sm text-gray-600">
                      <h4 className="font-medium">コツ:</h4>
                      <p>{recipe.tips}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={onClose} className="bg-orange-500 hover:bg-orange-600 text-white">閉じる</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
