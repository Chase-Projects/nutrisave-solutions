import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OptimizationResults } from "@/components/OptimizationResults";
import { FoodSearch } from "@/components/FoodSearch";
import { solveNutritionOptimization, type OptimizationResult } from "@/utils/lpSolver";
import { USDA_FOODS, type Food } from "@/utils/nutritionData";
import { Calculator, Info, Database } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Example food combinations - designed so foods complement each other
// Grains are LOW in lysine, legumes are LOW in methionine
// Combining them is cheaper than using either alone
const EXAMPLE_FOODS: Record<string, Food[]> = {
  "Pita & Hummus": [
    {
      id: "example_pita",
      name: "Pita Bread (whole wheat)",
      category: "Grains",
      cost: 0.20, // Cheap grain
      histidine: 226,
      isoleucine: 367,
      leucine: 671,
      lysine: 130, // Grains are LOW in lysine
      methionine: 200, // But good in methionine
      phenylalanine: 470,
      threonine: 282,
      tryptophan: 149,
      valine: 441,
      energy: 275,
      protein: 9.8,
      carbs: 55,
      fat: 2.6,
    },
    {
      id: "example_hummus",
      name: "Hummus (chickpeas)",
      category: "Legumes",
      cost: 0.25, // Cheap legume
      histidine: 280,
      isoleucine: 440,
      leucine: 730,
      lysine: 670, // Legumes are HIGH in lysine
      methionine: 60, // But LOW in methionine
      phenylalanine: 530,
      threonine: 380,
      tryptophan: 100,
      valine: 430,
      energy: 166,
      protein: 8,
      carbs: 14,
      fat: 9.6,
    },
  ],
  "Rice & Beans": [
    {
      id: "example_rice",
      name: "Brown Rice (cooked)",
      category: "Grains",
      cost: 0.10, // Very cheap grain
      histidine: 80,
      isoleucine: 130,
      leucine: 250,
      lysine: 60, // Very low lysine (grain weakness)
      methionine: 75, // Good methionine
      phenylalanine: 160,
      threonine: 110,
      tryptophan: 35,
      valine: 180,
      energy: 112,
      protein: 2.6,
      carbs: 24,
      fat: 0.9,
    },
    {
      id: "example_beans",
      name: "Black Beans (cooked)",
      category: "Legumes",
      cost: 0.15, // Cheap legume
      histidine: 280,
      isoleucine: 440,
      leucine: 800,
      lysine: 680, // High lysine (legume strength)
      methionine: 50, // Low methionine (legume weakness)
      phenylalanine: 540,
      threonine: 420,
      tryptophan: 120,
      valine: 520,
      energy: 132,
      protein: 8.9,
      carbs: 24,
      fat: 0.5,
    },
  ],
  "Eggs & Toast": [
    {
      id: "example_eggs",
      name: "Eggs (whole)",
      category: "Protein",
      cost: 0.30,
      histidine: 300,
      isoleucine: 650,
      leucine: 1050,
      lysine: 880,
      methionine: 370,
      phenylalanine: 650,
      threonine: 580,
      tryptophan: 160,
      valine: 800,
      energy: 155,
      protein: 13,
      carbs: 1.1,
      fat: 11,
    },
    {
      id: "example_toast",
      name: "Whole Wheat Bread",
      category: "Grains",
      cost: 0.15,
      histidine: 180,
      isoleucine: 300,
      leucine: 550,
      lysine: 180, // Low lysine
      methionine: 140,
      phenylalanine: 390,
      threonine: 230,
      tryptophan: 100,
      valine: 360,
      energy: 247,
      protein: 8.5,
      carbs: 41,
      fat: 3.4,
    },
  ],
};

const Index = () => {
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [selectedFoods, setSelectedFoods] = useState<Food[]>([]);
  const [useCustomFoods, setUseCustomFoods] = useState(false);
  const [activeTab, setActiveTab] = useState("optimize");

  const handleOptimize = (customFoods?: Food[], switchToResults = false) => {
    setIsCalculating(true);
    // Simulate calculation time for better UX
    setTimeout(() => {
      const foodDatabase = customFoods && customFoods.length > 0 ? customFoods : USDA_FOODS;
      const optimizationResult = solveNutritionOptimization(foodDatabase);
      setResult(optimizationResult);
      setIsCalculating(false);
      if (switchToResults) {
        setActiveTab("optimize");
      }
    }, 800);
  };

  const handleOptimizeWithSelected = () => {
    if (selectedFoods.length === 0) {
      return;
    }
    setUseCustomFoods(true);
    handleOptimize(selectedFoods, true);
  };

  const handleExampleClick = (exampleName: string) => {
    const foods = EXAMPLE_FOODS[exampleName];
    if (foods) {
      setSelectedFoods(foods);
      setUseCustomFoods(true);
      handleOptimize(foods, true);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="gradient-hero text-primary-foreground py-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20">
            <Calculator className="w-4 h-4" />
            <span className="text-sm font-medium">Linear Programming Optimizer</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Optimal Nutrition,
            <br />
            Minimal Cost
          </h1>
          
          <p className="text-lg md:text-xl text-primary-foreground/90 max-w-2xl mx-auto">
            Using linear programming to find the most cost-effective plan that satisfies
            WHO essential amino acid requirements
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => handleOptimize()}
              disabled={isCalculating}
              size="lg"
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-xl"
            >
              {isCalculating ? (
                <>
                  <Calculator className="w-5 h-5 mr-2 animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <Calculator className="w-5 h-5 mr-2" />
                  Quick Optimize
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="bg-primary-foreground/90 text-primary border-primary/20 hover:bg-primary-foreground shadow-xl"
              onClick={() => {
                setActiveTab("search");
                setTimeout(() => {
                  const element = document.getElementById("food-search");
                  element?.scrollIntoView({ behavior: "smooth" });
                }, 100);
              }}
            >
              <Database className="w-5 h-5 mr-2" />
              Custom Food Selection
            </Button>
          </div>

          {/* Example buttons */}
          <div className="pt-4">
            <p className="text-sm text-primary-foreground/70 mb-3">Try an example:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {Object.keys(EXAMPLE_FOODS).map((exampleName) => (
                <Button
                  key={exampleName}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleExampleClick(exampleName)}
                  disabled={isCalculating}
                  className="bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30 border border-primary-foreground/30"
                >
                  {exampleName}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Info Alert */}
      <div className="max-w-6xl mx-auto px-4 -mt-6 mb-8">
        <Alert className="shadow-custom-lg bg-card">
          <Info className="h-4 w-4" />
          <AlertDescription>
            This tool uses Linear Programming (Simplex algorithm) to minimize daily food costs
            while meeting WHO essential amino acid requirements (histidine, isoleucine, leucine, lysine, 
            methionine, phenylalanine, threonine, tryptophan, valine). Foods must have amino acid data.
          </AlertDescription>
        </Alert>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="optimize">Results</TabsTrigger>
            <TabsTrigger value="search" id="food-search">
              USDA Search
            </TabsTrigger>
          </TabsList>

          <TabsContent value="optimize" className="space-y-6">
            {result && result.feasible ? (
              <>
                {useCustomFoods && (
                  <Alert className="shadow-custom-lg bg-success/5 border-success/20">
                    <Database className="h-4 w-4 text-success" />
                    <AlertDescription className="text-success-foreground">
                      Optimized using {selectedFoods.length} custom foods from USDA database
                    </AlertDescription>
                  </Alert>
                )}
                <OptimizationResults result={result} />
              </>
            ) : result && !result.feasible ? (
              <Alert variant="destructive" className="shadow-custom-lg">
                <AlertDescription>
                  No feasible solution found. Try selecting more diverse foods or using the default
                  database.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                  <Calculator className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">
                  Click "Quick Optimize" or select custom foods to calculate the optimal meal plan
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="search" className="space-y-6">
            <FoodSearch selectedFoods={selectedFoods} onFoodsSelected={setSelectedFoods} />
            {selectedFoods.length > 0 && (
              <div className="flex justify-center">
                <Button
                  onClick={handleOptimizeWithSelected}
                  disabled={isCalculating}
                  size="lg"
                  className="shadow-xl"
                >
                  {isCalculating ? (
                    <>
                      <Calculator className="w-5 h-5 mr-2 animate-spin" />
                      Optimizing...
                    </>
                  ) : (
                    <>
                      <Calculator className="w-5 h-5 mr-2" />
                      Optimize with {selectedFoods.length} Selected Foods
                    </>
                  )}
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-6xl mx-auto text-center text-sm text-muted-foreground space-y-2">
          <p>
            Amino acid data from food database • WHO/FAO essential amino acid requirements
          </p>
          <p className="text-xs">
            Optimization via Simplex LP Solver • Focuses on 9 essential amino acids
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
