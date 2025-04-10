import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { roommateFilterSchema, RoommateFilter } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, MapPin, DollarSign } from "lucide-react";

interface FilterFormProps {
  onApplyFilters: (filters: RoommateFilter) => void;
  isLoading: boolean;
}

export default function FilterForm({ onApplyFilters, isLoading }: FilterFormProps) {
  const [selectedLifestyles, setSelectedLifestyles] = useState<string[]>([]);

  const form = useForm<RoommateFilter>({
    resolver: zodResolver(roommateFilterSchema),
    defaultValues: {
      location: "",
      budgetMin: undefined,
      budgetMax: undefined,
      preferredGender: "any",
      smoking: "any",
      lifestyle: [],
    },
  });

  const handleLifestyleChange = (value: string) => {
    setSelectedLifestyles(prev => {
      if (prev.includes(value)) {
        return prev.filter(item => item !== value);
      } else {
        return [...prev, value];
      }
    });
  };

  const onSubmit = (data: RoommateFilter) => {
    // Add selected lifestyles to the form data
    const filtersWithLifestyle = {
      ...data,
      lifestyle: selectedLifestyles,
    };
    onApplyFilters(filtersWithLifestyle);
  };

  const handleReset = () => {
    form.reset();
    setSelectedLifestyles([]);
    onApplyFilters({});
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="block text-sm font-medium text-gray-700 mb-1">Location</FormLabel>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <FormControl>
                  <Input 
                    placeholder="City or ZIP code" 
                    className="pl-10" 
                    {...field} 
                  />
                </FormControl>
              </div>
            </FormItem>
          )}
        />
        
        <div>
          <FormLabel className="block text-sm font-medium text-gray-700 mb-1">Budget Range</FormLabel>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="budgetMin"
              render={({ field }) => (
                <FormItem>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Min" 
                        className="pl-10" 
                        {...field}
                        onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)} 
                      />
                    </FormControl>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="budgetMax"
              render={({ field }) => (
                <FormItem>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Max" 
                        className="pl-10" 
                        {...field}
                        onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)} 
                      />
                    </FormControl>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <FormField
          control={form.control}
          name="preferredGender"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="block text-sm font-medium text-gray-700 mb-1">Gender Preference</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="nonbinary">Non-binary</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="smoking"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="block text-sm font-medium text-gray-700 mb-1">Smoking Preference</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="any" id="any-smoking" />
                    <label htmlFor="any-smoking" className="text-sm">Any</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="non-smoker" />
                    <label htmlFor="non-smoker" className="text-sm">Non-smoker</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="smoker" />
                    <label htmlFor="smoker" className="text-sm">Smoker</label>
                  </div>
                </RadioGroup>
              </FormControl>
            </FormItem>
          )}
        />
        
        <div>
          <FormLabel className="block text-sm font-medium text-gray-700 mb-1">Lifestyle</FormLabel>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "early-bird", label: "Early bird" },
              { id: "night-owl", label: "Night owl" },
              { id: "introvert", label: "Introvert" },
              { id: "extrovert", label: "Extrovert" },
              { id: "clean", label: "Clean" },
              { id: "pet-friendly", label: "Pet-friendly" },
            ].map(({ id, label }) => (
              <div key={id} className="flex items-center space-x-2">
                <Checkbox 
                  id={id} 
                  checked={selectedLifestyles.includes(id)}
                  onCheckedChange={() => handleLifestyleChange(id)} 
                />
                <label
                  htmlFor={id}
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {label}
                </label>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Applying...
              </>
            ) : (
              "Apply Filters"
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full mt-2"
            onClick={handleReset}
          >
            Reset Filters
          </Button>
        </div>
      </form>
    </Form>
  );
}
