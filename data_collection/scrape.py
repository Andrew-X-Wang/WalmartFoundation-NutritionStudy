# scrape peapod for products
# Abby Mosca 07.01.2019

from bs4 import BeautifulSoup 
import os
import pandas as pd

#change wd to script directory
abspath = os.path.abspath(__file__)
wdname = os.path.dirname(abspath)
os.chdir(wdname)


#loop through htm pages in peapod_html  directory
rootdir = "peapod_html"
data = []

for subdir, dirs, files in os.walk(rootdir):
    for file in files:
        filename = os.fsdecode(file)
        if filename.endswith(".htm"):
            with open(os.path.join(subdir, file)) as fp:
                soup = BeautifulSoup(fp, "html.parser")
                for item in soup.find_all(class_="product-cell product-grid-cell product-grid-cell--quad"):
                    row = {}
                    row['Item'] = item['aria-label']
                    for thing in item.find_all(class_="product-grid-cell_main-price select-text"):
                        row['Reg_Price'] = thing.string
                    for thing in item.find_all(class_="product-grid-cell_main-price select-text product-grid-cell_main-price--on-sale"):
                        row['Sale_Price'] = thing.string
                    for thing in item.find_all(class_="product-grid-cell_size select-text"):
                        row['Size'] = thing.string
                    for thing in item.find_all(class_="product-grid-cell_unit select-text"):
                        row['Unit_Size'] = thing.string
                    row['Image'] = item.img['src']
                    #Add category info
                    cat = subdir.split('/')[1]
                    print(cat)
                    row['Category'] = cat
                    sub = file.split('.')[0]
                    subcat = sub.split(cat + '_')[1]
                    row['Subcategory'] = subcat
                    print(subcat)
                    data.append(row)
        else:
            continue 

df = pd.DataFrame(data)
df = df[['Item','Reg_Price','Sale_Price','Size','Unit_Size', "Image", "Category", "Subcategory"]]

df.to_csv("peapod_products.csv")


    





















