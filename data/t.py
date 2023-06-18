import csv
import json
input_file_name = "longlat.json"
output_file_name = "longlat.csv"
# music.json 파일을 읽어서 melon.csv 파일에 저장
with open('longlat.json', 'r', encoding = 'utf-8') as input_file, open('longlat.csv', 'w', newline = '') as output_file :
    data = json.load(input_file)
    
    '''
    data[0] 은 json 파일의 한 줄을 보관 {"title:"Super Duper", "songId": ...}
    data[0]['컬럼명'] 은 첫 번째 줄의 해당 컬럼 element 보관
    '''
 
    f = csv.writer(output_file)
    
    # csv 파일에 header 추가
    f.writerow(["LOCATION", "sw_lat", "sw_long", "ne_lat", "ne_long"])
    
    # 노래 제목에 아래 문구가 포함 되어있을 경우 csv 저장하지 않음
    matches = ['inst.', 'Inst.']
    
    # write each row of a json file
    for datum in data:
        print(datum)
        print(data[datum])
            
        f.writerow([datum, data[datum]["sw"]["lat"], data[datum]["sw"]["lon"], data[datum]["ne"]["lat"], data[datum]["ne"]["lon"]])