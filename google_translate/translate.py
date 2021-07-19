from google.cloud import translate_v2 as translater
from tqdm import tqdm
import os
import pandas as pd
import argparse

os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = './google_credential.json'

translate_client = translater.Client()

def translate_row(row):
    res = row.copy()
    try:
        res['text'] = translate_client.translate(
            row['text'],
            target_language='en',
            source_language='es'
        )['translatedText']
    except:
        print(res['content_key'])
        res['text'] = ''

    return res


def translate(input_path, output_path):
    df = pd.read_csv(input_path, sep='|')
    df = df[df['language'] == 'Español']

    tqdm.pandas()
    df_translated = df.progress_apply(translate_row, axis=1)
    df_translated.to_csv(output_path, index=False, sep='|')


if __name__ == '__main__':

    parser = argparse.ArgumentParser(description='Donwload the entelai-predoc raw data')

    parser.add_argument(
        '--input_path',
        type=str,
        default='./content_data.csv',
        help='The input path of the dataframe to translate'
    )

    parser.add_argument(
        '--output_path',
        type=str,
        default='./content_data_translated.csv',
        help='The output path where to store the translated dataframe'
    )

    args = parser.parse_args()
    
    translate(
        args.input_path,
        args.output_path
    )