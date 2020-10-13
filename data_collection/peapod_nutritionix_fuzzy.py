#peapod_nutritionix_fuzzy.py

#usdaDBmatching.py

import requests
import json
import pandas as pd 
import os
import time 
import csv
import requests_html
from requests_html import HTMLSession
from pandas.io.json import json_normalize
import re


abspath = os.path.abspath(__file__)
dname = os.path.dirname(abspath)
os.chdir(dname)

#import everything to one dataframe 
df = pd.DataFrame()

ds = pd.read_csv("peapod_products.csv", header = 0)
ds.columns = ["","Item", "Reg_Price", "Sale_Price", "Size", "Unit_Size", "Image", "Category", "Subcatecory"]
df = df.append(ds)
df = df.sample(n = 45)

results = []

headers = {'Content-Type': 'application/json',
           'x-app-id': '6600904b',
           'x-app-key': '815c50bafb6f848741b338e86f6aa19f'}

for index, row in df.iterrows():

    lookup = str(row["Item"])

    print(lookup)

    url = "https://trackapi.nutritionix.com/" + "/v2/search/instant?query=" + lookup

    response = requests.get(url, headers=headers)
    data = json.loads(response.text)
    print(response.status_code)

    ls = []
    ls.append(response.status_code) #status code

    try:
        curr_food = data['branded'][0]
        try:
            ls.append(curr_food['brand_name_item_name']) #nutritionix_title
        except KeyError as e:
            ls.append("No Title")
    except KeyError as e:
        ls.append("No match")

    ls.append(row["Item"])
    results.append(ls)

results = pd.DataFrame(results, columns = ["code", "nutritionix_title", "peapod_title"])

results.to_csv('peapod_nutritionix_fuzzy_matching.csv', index = False)
