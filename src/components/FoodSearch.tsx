import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Loader2, Plus, Check } from "lucide-react";
import { searchUSDAFoods, parseUSDAFoodToNutrition, type USDAFood } from "@/utils/usdaApi";
import type { Food } from "@/utils/nutritionData";
import { useToast } from "@/hooks/use-toast";

interface FoodSearchProps {
  onFoodsSelected: (foods: Food[]) => void;
  selectedFoods: Food[];
}

export const FoodSearch = ({ onFoodsSelected, selectedFoods }: FoodSearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<USDAFood[]>([]);
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await searchUSDAFoods(searchQuery, 20);
      setSearchResults(results.foods);
      if (results.foods.length === 0) {
        toast({
          title: "No results",
          description: "Try a different search term",
        });
      }
    } catch (error) {
      toast({
        title: "Search failed",
        description: "Could not fetch USDA data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const toggleFoodSelection = (usdaFood: USDAFood) => {
    const parsedFood = parseUSDAFoodToNutrition(usdaFood);
    const isSelected = selectedFoods.some((f) => f.id === parsedFood.id);

    if (isSelected) {
      onFoodsSelected(selectedFoods.filter((f) => f.id !== parsedFood.id));
    } else {
      onFoodsSelected([...selectedFoods, parsedFood]);
    }
  };

  const isFoodSelected = (fdcId: number) => {
    return selectedFoods.some((f) => f.id === `usda_${fdcId}`);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 shadow-custom-lg">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <span className="h-1 w-1 rounded-full bg-primary"></span>
          Search USDA Food Database
        </h2>
        
        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <Input
            type="text"
            placeholder="Search for foods (e.g., chicken breast, broccoli)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={isSearching}>
            {isSearching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </Button>
        </form>

        {selectedFoods.length > 0 && (
          <div className="mb-4 p-4 bg-primary/5 rounded-lg border border-primary/10">
            <p className="text-sm font-medium text-foreground mb-2">
              Selected: {selectedFoods.length} foods
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedFoods.map((food) => (
                <Badge key={food.id} variant="secondary" className="text-xs">
                  {food.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {searchResults.length > 0 && (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {searchResults.map((food) => {
              const isSelected = isFoodSelected(food.fdcId);
              return (
                <div
                  key={food.fdcId}
                  className="flex items-start gap-3 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => toggleFoodSelection(food)}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleFoodSelection(food)}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-medium text-foreground text-sm leading-tight">
                        {food.description}
                      </h3>
                      {isSelected && (
                        <Check className="w-4 h-4 text-success flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {food.foodCategory && (
                        <Badge variant="outline" className="text-xs">
                          {food.foodCategory}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {food.dataType}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      {food.foodNutrients.slice(0, 3).map((nutrient, idx) => (
                        <span key={idx}>
                          {nutrient.nutrientName}: {nutrient.value.toFixed(1)}
                          {nutrient.unitName}
                          {idx < 2 && idx < food.foodNutrients.length - 1 && " • "}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};
