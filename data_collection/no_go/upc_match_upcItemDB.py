import requests
import json
import pandas as pd 
import os
import time 
import csv
from pandas.io.json import json_normalize

#change wd to script directory
abspath = os.path.abspath(__file__)
dname = os.path.dirname(abspath)
os.chdir(dname)

#import everything to one dataframe 
names = ["Coffee tea water", "Baking ingredients", "Spreads dips", 
            "Snacks", "Seasonings", "Produce", "Prepared meals", 
            "Oil vinegar dressing", "Meats", "Legumes and nuts", 
            "Grains", "Fish and seafood", "Drinks", "Dairy and eggs", 
            "Desserts", "Condiments"]

df = pd.DataFrame()

for name in names:
    file = "nutrisavings_data/" + name + ".xlsx"
    ds = pd.read_excel(file, header = 0)
    ds.columns = ["CurrUPC", "ProductName", "BrandName", 
                    "ProductDesc", "ProductScore", "Subcatecory"]
    ds['Category'] = name 
    ds['CurrUPC'] = ds['CurrUPC'].apply(lambda x: '{0:0>12}'.format(x))
    df = df.append(ds)

#get random sample of 100  
samp = df.sample(n = 100, random_state = 3)

#send requests
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}

results = []

for index, row in samp.iterrows():
    url = 'https://api.upcitemdb.com/prod/trial/lookup?upc=' + row['CurrUPC'] 
    resp = requests.get(url, headers=headers)
    data = json.loads(resp.text)
    
    ls = []
    ls.append(data['code'])

    try: 
        l = len(data['items']) 
        try: 
            ls.append(data['items'][0]['title'])
        except KeyError as e:
            ls.append("NA")
        try:
            ls.append(data['items'][0]['upc'])
        except KeyError as e:
            ls.append("NA")
        try:
            ls.append(data['items'][0]['description'])
        except KeyError as e:
            ls.append("NA")
        try:
            ls.append(data['items'][0]['brand'])
        except KeyError as e:
            ls.append("NA")
        try:
            ls.append(data['items'][0]['currency'])
        except KeyError as e:
            ls.append("NA")
        try:
            ls.append(data['items'][0]['lowest_recorded_price'])
        except KeyError as e:
            ls.append("NA")
        try:
            ls.append(data['items'][0]['highest_recorded_price'])
        except KeyError as e:
            ls.append("NA")
        try:
            ls.append(data['items'][0]['images'])
        except KeyError as e:
            ls.append("NA")
    except KeyError as e: 
        ls.append("NA")
        ls.append("NA")
        ls.append("NA")
        ls.append("NA")
        ls.append("NA")
        ls.append("NA")
        ls.append("NA")
        ls.append("NA")
    except IndexError as e: 
        ls.append("NA")
        ls.append("NA")
        ls.append("NA")
        ls.append("NA")
        ls.append("NA")
        ls.append("NA")
        ls.append("NA")
        ls.append("NA")

    ls.append(row["CurrUPC"])
    ls.append(row["ProductName"])
    ls.append(row["BrandName"])
    ls.append(row["ProductDesc"])
    ls.append(row["ProductScore"])
    ls.append(row["Subcatecory"])
    ls.append(row["Category"])

    results.append(ls)
    time.sleep(10) #only allowed 6 requests / min 

results = pd.DataFrame(results, columns = ["mCode", "mTitle", "mUPC", "mDesc", "mBrand", 
                    "mCurr", "mLowest", "mHighest", "mImages",
                    "CurrUPC", "ProductName", "BrandName", 
                    "ProductDesc", "ProductScore", "Subcatecory", "Category"])
results.to_csv('results.csv', index = False )






