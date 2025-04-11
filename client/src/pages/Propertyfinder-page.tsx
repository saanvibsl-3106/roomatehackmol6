// import React, { useState } from "react";


// const PropertySearch = () => {
//   const [filters, setFilters] = useState({
//     budget: "",
//     type: "", // bachelor or couple
//     petFriendly: false,
//     smoker: false,
//     gender: "", // boys, girls, coed
//   });

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//   const target = e.target;

//   const value =
//     target instanceof HTMLInputElement && target.type === "checkbox"
//       ? target.checked
//       : target.value;

//   setFilters((prev) => ({
//     ...prev,
//     [target.name]: value,
//   }));
// };


//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     console.log("Searching with filters:", filters);
//     // Make API call here
//   };

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-4">Search Properties</h1>
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <input name="budget" type="number" placeholder="Budget" onChange={handleChange} className="border p-2 w-full" />

//         <select name="type" onChange={handleChange} className="border p-2 w-full">
//           <option value="">Select Type</option>
//           <option value="bachelor">Bachelor</option>
//           <option value="couple">Couple</option>
//         </select>

//         <label>
//           <input name="petFriendly" type="checkbox" onChange={handleChange} />
//           Pet Friendly
//         </label>

//         <label>
//           <input name="smoker" type="checkbox" onChange={handleChange} />
//           Smoker Allowed
//         </label>

//         <select name="gender" onChange={handleChange} className="border p-2 w-full">
//           <option value="">Gender Preference</option>
//           <option value="boys">Boys</option>
//           <option value="girls">Girls</option>
//           <option value="coed">Coed</option>
//         </select>

//         <button type="submit" className="bg-blue-500 text-white px-4 py-2">Search</button>
//       </form>
//     </div>
//   );
// };

// export default PropertySearch;


import React, { useState } from "react";
import propertyData from "./properties.ts";
import { calculateDistance } from "../lib/geo.ts";

const PropertySearch = () => {
  const [filters, setFilters] = useState({
    budget: "",
    type: "",
    petFriendly: false,
    smoker: false,
    gender: "",
    location: "",
  });

  const [results, setResults] = useState(propertyData);

  // const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  //   const { name, type, value, checked } = e.target;
  //   setFilters((prev) => ({
  //     ...prev,
  //     [name]: type === "checkbox" ? checked : value,
  //   }));
  // };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  const target = e.target as HTMLInputElement | HTMLSelectElement;
  const value = target.type === "checkbox" ? (target as HTMLInputElement).checked : target.value;

  setFilters((prev) => ({
    ...prev,
    [target.name]: value,
  }));
};


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const filtered = propertyData
      .filter((property) => {
        return (
          (!filters.budget || property.budget <= Number(filters.budget)) &&
          (!filters.type || property.type === filters.type) &&
          (!filters.gender || property.gender === filters.gender) &&
          (!filters.petFriendly || property.petFriendly === true) &&
          (!filters.smoker || property.smoker === true)
        );
      })
      .sort((a, b) => {
        if (!filters.location) return 0;
        const aDist = calculateDistance(filters.location, a.location);
        const bDist = calculateDistance(filters.location, b.location);
        return aDist - bDist;
      });

    setResults(filtered);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Find a Property</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="budget" type="number" placeholder="Max Budget" onChange={handleChange} className="border p-2 w-full" />
        <input name="location" type="text" placeholder="Your Location (e.g., Andheri)" onChange={handleChange} className="border p-2 w-full" />

        <select name="type" onChange={handleChange} className="border p-2 w-full">
          <option value="">Room Type</option>
          <option value="bachelor">Bachelor</option>
          <option value="couple">Couple</option>
        </select>

        <select name="gender" onChange={handleChange} className="border p-2 w-full">
          <option value="">Gender Preference</option>
          <option value="boys">Boys</option>
          <option value="girls">Girls</option>
          <option value="coed">Coed</option>
        </select>

        <label className="flex items-center space-x-2">
          <input name="petFriendly" type="checkbox" onChange={handleChange} />
          <span>Pet Friendly</span>
        </label>

        <label className="flex items-center space-x-2">
          <input name="smoker" type="checkbox" onChange={handleChange} />
          <span>Smoker Allowed</span>
        </label>

        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Search</button>
      </form>

      <div className="mt-6 space-y-4">
        {results.length === 0 ? (
          <p>No properties found.</p>
        ) : (
          results.map((prop, idx) => (
            <div key={idx} className="border p-4 rounded shadow">
              <h2 className="text-lg font-semibold">{prop.title}</h2>
              <p>Location: {prop.location}</p>
              <p>Budget: ₹{prop.budget}</p>
              <p>Type: {prop.type}</p>
              <p>Gender: {prop.gender}</p>
              <p>Pet Friendly: {prop.petFriendly ? "Yes" : "No"}</p>
              <p>Smoker Allowed: {prop.smoker ? "Yes" : "No"}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PropertySearch;

