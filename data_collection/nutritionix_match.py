# match peapod products to nutritionix database
# Ab Mosca 07.08.2019

import os
import pandas as pd
import requests
import json
from usda.client import UsdaClient


#change wd to current directory
abspath = os.path.abspath(__file__)
wdname = os.path.dirname(abspath)
os.chdir(wdname)

#get peapod products into dataframe
filename = wdname + "/peapod_products.csv"
df = pd.read_csv(filename, sep=',')
#print(df.head())

#NqkZOVymIkbkboyC7Mt5FWy3AzSEXLZlRmgDH5wj

client = UsdaClient("NqkZOVymIkbkboyC7Mt5FWy3AzSEXLZlRmgDH5wj")
for food in df['Item']:
    try:
        foods_search = client.search_foods(food, 1)
        res = next(foods_search)
        print(res)
    except:
        print("no match") 

#match with nutritionix db on name
# req_headers = {'api_key':'NqkZOVymIkbkboyC7Mt5FWy3AzSEXLZlRmgDH5wj','Content-Type':'application/json'}
# req_url = "https://DEMO_KEY@api.nal.usda.gov/fdc/v1/search" 
# query = {"generalSearchInput":"Food For Life Ezekiel 4:9 Bread Sprouted Grain Flourless Organic"}
# r = requests.post(url = req_url, headers=req_headers, json=query)
# data = json.loads(r.content.decode('utf-8'))
# print(data)