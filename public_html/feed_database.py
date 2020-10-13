#This doesn't actually feed the database - it just gets the products in 
# database form
import pandas as pd 
import os
import csv
from pandas.io.json import json_normalize
import random
import math

abspath = os.path.abspath(__file__)
dname = os.path.dirname(abspath)
os.chdir(dname)

#import everything to one dataframe 
df = pd.DataFrame()

ds = pd.read_csv("../data_collection/peapod_products.csv", header = 0)
ds.columns = ["","Item", "Reg_Price", "Sale_Price", 
              "Size", "Unit_Size", "Image", "Category", "Subcategory",
              "ingredients", "serving_unit", "serving_qty", 
              "serving_weight_grams", "calories", "total_fat", "saturated_fat"   
              "cholesterol", "sodium", "total_carbs", "fiber", "sugars", 
              "protein", "potassium"]
df = df.append(ds)

foods = []

for index, row in df.iterrows():
    data = []

    data.append(row["Item"]) #name

    if (not str(row["Reg_Price"]) == "nan"): #price
        data.append(str(row["Reg_Price"]).replace('$', ''))
    else:
        data.append(str(row["Sale_Price"]).replace('$', ''))

    img  = row["Image"][2:]
    path = "/product_images/" + row["Category"] + "/" + img

    data.append(path) #image

    data.append(str(row["Size"])) #size
    data.append(str(row["Unit_Size"])) #unit_price
    data.append(row["Category"]) #category
    data.append(row["Subcategory"]) #subcategory

    #append the nutrient details
    data.append(row["ingredients"])
    data.append(row["serving_unit"]) 
    data.append(row["serving_qty"]) 
    data.append(row["serving_weight_grams"]) 
    data.append(row["calories"]) 
    data.append(row["total_fat"]) 
    data.append(row["saturated_fat"]) 
    data.append(row["cholesterol"]) 
    data.append(row["sodium"]) 
    data.append(row["total_carbs"]) 
    data.append(row["fiber"]) 
    data.append(row["sugars"]) 
    data.append(row["protein"]) 
    data.append(row["potassium"]) 

    health_score = random.randint(1, 10)
    data.append(health_score) #health_score
    foods.append(data)

db_columns = ["name",         "price",        "image",          "size", 
              "unit_price",   "category",     "subcategory",    "ingredients", 
              "serving_unit", "serving_qty",  "serving_weight", "calories",     
              "total_fat",    "saturated_fat" "cholesterol",    "sodium",      
              "total_carbs",  "fiber",        "sugars",         "protein",     
              "potassium",    "health_score"]

foods = pd.DataFrame(foods, columns = db_columns)

foods.to_csv('products_full.csv', index = True)
