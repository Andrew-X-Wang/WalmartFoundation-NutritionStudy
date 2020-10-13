#peapod_nutritionix_fuzzy.py

#usdaDBmatching.py
import pandas as pd 
import os
import csv
from pandas.io.json import json_normalize
import mysql
import mysql.connector


abspath = os.path.abspath(__file__)
dname = os.path.dirname(abspath)
os.chdir(dname)

#import everything to one dataframe 
df = pd.DataFrame()

ds = pd.read_csv("peapod_products.csv", header = 0)
ds.columns = ["","Item", "Reg_Price", "Sale_Price", "Size", "Unit_Size", "Image", "Category", "Subcatecory"]
df = df.append(ds)


df = df.loc[df['Category'].isin(['Breakfast_Cereal'])]


# var con = mysql.createConnection({
#     host     : 'mysql-user.eecs.tufts.edu',
#     user     : 'nutritionStudy',
#     password : 'walmart',
#     database : 'nutritionStudy'
# });

try:
  cnx = mysql.connector.connect(user='nutritionStudy', password='walmart',
                                host='mysql-user.eecs.tufts.edu',
                                database='nutritionStudy')
except mysql.connector.Error as err:
  if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
    print("Something is wrong with your user name or password")
  elif err.errno == errorcode.ER_BAD_DB_ERROR:
    print("Database does not exist")
  else:
    print(err)




# results = []



# for index, row in df.iterrows():



#     try:
#         curr_food = data['branded'][0]
#         try:
#             ls.append(curr_food['brand_name_item_name']) #nutritionix_title
#         except KeyError as e:
#             ls.append("No Title")
#     except KeyError as e:
#         ls.append("No match")

#     ls.append(row["Item"])
#     results.append(ls)

# results = pd.DataFrame(results, columns = ["code", "nutritionix_title", "peapod_title"])

# results.to_csv('peapod_nutritionix_fuzzy_matching.csv', index = False)
