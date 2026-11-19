# NutriAI Expanded South Indian / Indian-style Food Catalog

Contains 11 CSVs: 8 meal categories and 3 health-guidance datasets. **159 original + 70 added = 229 food records.** The original 159 food records remain unchanged and their IDs are preserved. The 30 health rules are unchanged.

Food CSV schema has exactly 10 columns, no region: food_id, food_item, food_category, calories_per_100g, protein_per_100g, carbs_per_100g, fats_per_100g, fibre_per_100g, ingredients, preparation_method. Nonvegetarian/vegetarian selection inferred from filenames. No recipe names contain “homemade”.

## New dishes
Added idli/dosa combinations with peanut, coconut and tomato chutney; soya chunks; paneer; mushroom dishes; veg/egg/chicken/fish/country chicken/mutton biryanis; fried rice variants; chilli and pepper preparations. Multi-component entries include their accompaniment ingredients. The same dish may appear in lunch and dinner by design.

## Critical reliability notice
**All nutrition values, including the original 159 records, are DEVELOPMENT ESTIMATES, not values validated against weighed prepared recipes or directly reconciled to IFCT/USDA.** Estimates use the ingredient table in the original user-provided files(1).zip, which explicitly says its nutrient values are approximate/unverified, plus unweighed ingredient and cooked-yield assumptions. New records calculate per 100 g estimated prepared batch from ingredient amounts and approximate cooked yield (some starchy ingredients expand with water). The docs/RECIPE_ASSUMPTIONS_AUDIT.csv records batches. Do not claim verified nutrition or clinical safety; do not use as prescribed diets.

**Particular caution:** the source reference has **no mushrooms entry**: mushroom recipes use mixed-vegetable nutrient values as a DEMONSTRATION-ONLY proxy; source table has **no country-chicken-specific value**: country chicken uses chicken-thigh values as proxy. These recipes require true nutrient data before reliable nutrient-focused planning. Do not treat the proxies as evidence. Wheat noodles use an approximate flour-based proxy instead of verified prepared-noodle nutrient values. Spices/sauces and oil retention are not fully represented, and fried rice recipes are simplified.

## Backend compatibility
Replace the 11 CSVs in ~/Desktop/NutriAI/datasets. Existing food_loader.py reads the exact same 10 food columns and dietary types from filenames; no Python code needs modification. The current meal_planner.py normalizes most names but should add aliases/recipe identities for synonymous dish names. Hard limits: once per day, max 3/week; omnivore two veg and two nonveg slots daily.

Health CSVs are preliminary rules, not universal clinical exclusion rules. Adult calorie management and especially minors and medical conditions require stronger safeguards.

Sources for future verification (not sources of the specific estimates):
ICMR-NIN IFCT 2017: https://www.nin.res.in/ebooks/IFCT2017.pdf
USDA FoodData Central: https://fdc.nal.usda.gov/

## Added counts
- nonveg_breakfast.csv: 2
- nonveg_dinner.csv: 9
- nonveg_lunch.csv: 13
- nonveg_snacks.csv: 5
- veg_breakfast.csv: 9
- veg_dinner.csv: 9
- veg_lunch.csv: 16
- veg_snacks.csv: 7
