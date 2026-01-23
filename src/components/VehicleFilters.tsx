import { useState } from 'react';
import { Slider } from './ui/slider';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Button } from './ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './ui/collapsible';
import { ChevronDown } from 'lucide-react';

interface VehicleFiltersProps {
  onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
  vehicleTypes: string[];
  fuelTypes: string[];
  companies: string[];
  priceRange: number[];
  minRating: number;
}

//const companies = ['Honda', 'TVS', 'Royal Enfield', 'Bajaj', 'Hero', 'Yamaha', 'Ather', 'KTM'];

export default function VehicleFilters({ onFilterChange }: VehicleFiltersProps) {
  const [vehicleTypes, setVehicleTypes] = useState<string[]>([]);
  const [fuelTypes, setFuelTypes] = useState<string[]>([]);
  const [companies, setCompanies] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number[]>([0, 1500]);
  const [minRating, setMinRating] = useState<number>(0);
  const [isCompanyOpen, setIsCompanyOpen] = useState(false);

  const companyList = ['Honda', 'TVS', 'Royal Enfield', 'Bajaj', 'Hero', 'Yamaha', 'Ather', 'KTM'];

  const handleVehicleTypeChange = (type: string, checked: boolean) => {
    const newTypes = checked
      ? [...vehicleTypes, type]
      : vehicleTypes.filter((t) => t !== type);
    setVehicleTypes(newTypes);
    onFilterChange({ vehicleTypes: newTypes, fuelTypes, companies, priceRange, minRating });
  };

  const handleFuelTypeChange = (type: string, checked: boolean) => {
    const newTypes = checked
      ? [...fuelTypes, type]
      : fuelTypes.filter((t) => t !== type);
    setFuelTypes(newTypes);
    onFilterChange({ vehicleTypes, fuelTypes: newTypes, companies, priceRange, minRating });
  };

  const handleCompanyChange = (company: string, checked: boolean) => {
    const newCompanies = checked
      ? [...companies, company]
      : companies.filter((c) => c !== company);
    setCompanies(newCompanies);
    onFilterChange({ vehicleTypes, fuelTypes, companies: newCompanies, priceRange, minRating });
  };

  const handlePriceChange = (value: number[]) => {
    setPriceRange(value);
    onFilterChange({ vehicleTypes, fuelTypes, companies, priceRange: value, minRating });
  };

  // const handleRatingChange = (rating: number) => {
  //   setMinRating(rating);
  //   onFilterChange({ vehicleTypes, fuelTypes, companies, priceRange, minRating: rating });
  // };

  const resetFilters = () => {
    setVehicleTypes([]);
    setFuelTypes([]);
    setCompanies([]);
    setPriceRange([0, 1500]);
    setMinRating(0);
    onFilterChange({
      vehicleTypes: [],
      fuelTypes: [],
      companies: [],
      priceRange: [0, 1500],
      minRating: 0,
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-24">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg text-black">Filters</h3>
        <Button
          variant="ghost"
          onClick={resetFilters}
          className="text-blue-500 hover:text-blue-600"
        >
          Reset
        </Button>
      </div>

      {/* Vehicle Type */}
      <div className="mb-6">
        <h4 className="text-black mb-3">Vehicle Type</h4>
        <div className="space-y-2">
          {['Scooter', 'Bike', 'Sports'].map((type) => (
            <div key={type} className="flex items-center">
              <Checkbox
                id={`type-${type}`}
                checked={vehicleTypes.includes(type)}
                onCheckedChange={(checked: boolean) =>
                  handleVehicleTypeChange(type, checked as boolean)
                }
              />
              <Label htmlFor={`type-${type}`} className="ml-2 cursor-pointer">
                {type}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Company - Dropdown with Checkboxes */}
      <div className="mb-6">
        <Collapsible open={isCompanyOpen} onOpenChange={setIsCompanyOpen}>
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center justify-between w-full p-3 border border-gray-300 rounded-md hover:bg-gray-50">
              <span className="text-black">
                Company {companies.length > 0 && `(${companies.length})`}
              </span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  isCompanyOpen ? 'rotate-180' : ''
                }`}
              />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <div className="border border-gray-200 rounded-md p-3 max-h-48 overflow-y-auto space-y-2">
              {companyList.map((company) => (
                <div key={company} className="flex items-center">
                  <Checkbox
                    id={`company-${company}`}
                    checked={companies.includes(company)}
                    onCheckedChange={(checked: boolean) =>
                      handleCompanyChange(company, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={`company-${company}`}
                    className="ml-2 cursor-pointer"
                  >
                    {company}
                  </Label>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Fuel Type */}
      <div className="mb-6">
        <h4 className="text-black mb-3">Fuel Type</h4>
        <div className="space-y-2">
          {['Petrol', 'Electric'].map((type) => (
            <div key={type} className="flex items-center">
              <Checkbox
                id={`fuel-${type}`}
                checked={fuelTypes.includes(type)}
                onCheckedChange={(checked: boolean) =>
                  handleFuelTypeChange(type, checked as boolean)
                }
              />
              <Label htmlFor={`fuel-${type}`} className="ml-2 cursor-pointer">
                {type}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <h4 className="text-black mb-3">Price Range (per day)</h4>
        <Slider
          min={0}
          max={1500}
          step={50}
          value={priceRange}
          onValueChange={handlePriceChange}
          className="mb-2"
        />
        <div className="flex justify-between text-sm text-gray-600">
          <span>₹{priceRange[0]}</span>
          <span>₹{priceRange[1]}</span>
        </div>
      </div>

      
    </div>
  );
}
