import pandas as pd

# Read the CSV files
smoke_df = pd.read_csv('smoke.csv')
alcohol_df = pd.read_csv('alcohol.csv')
population_df = pd.read_csv('population.csv')

# Merge the dataframes based on location and year
merged_df = pd.merge(smoke_df, alcohol_df, on=['LOCATION', 'TIME'])
merged_df = pd.merge(merged_df, population_df, on=['LOCATION', 'TIME'])

merged_df = merged_df.rename(columns={
    'LOCATION': 'Country',
    'INDICATOR_x': 'Smokers_Indicator',
    'SUBJECT_x': 'Smokers_Subject',
    'MEASURE_x': 'Smokers_Measure',
    'FREQUENCY_x': 'Smokers_Frequency',
    'Value_x': 'Smokers_Value',
    'Flag Codes_x': 'Smokers_Flag_Codes',
    'INDICATOR_y': 'Alcohol_Indicator',
    'SUBJECT_y': 'Alcohol_Subject',
    'MEASURE_y': 'Alcohol_Measure',
    'FREQUENCY_y': 'Alcohol_Frequency',
    'Value_y': 'Alcohol_Value',
    'Flag Codes_y': 'Alcohol_Flag_Codes',
    'INDICATOR': 'Population_Indicator',
    'SUBJECT': 'Population_Subject',
    'MEASURE': 'Population_Measure',
    'FREQUENCY': 'Population_Frequency',
    'Value': 'Population_Value',
    'Flag Codes': 'Population_Flag_Codes'
})

merged_df.to_csv("smoke_alcohol_pop_merged.csv", index=False)