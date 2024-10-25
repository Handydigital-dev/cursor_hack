import os
import logging
import google.generativeai as genai

# 環境変数からAPIキーを取得
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

async def get_recipes_from_gemini(ingredients, cooking_time="medium", difficulty="medium"):
    # 日本語でのプロンプトを設定
    prompt = (
        f"次の食材を使ってレシピを作成してください: {', '.join(ingredients)}。\n"
        f"調理時間は{cooking_time}、難易度は{difficulty}です。\n\n"
        "以下の形式で厳密に出力してください。各セクションは改行で区切り、箇条書きには必ず番号または'-'を使用してください：\n\n"
        "name: [レシピ名を一行で記載]\n"
        "cooking_time: [調理時間を「XX分」の形式で記載]\n"
        "difficulty: [難易度を「初級」「中級」「上級」のいずれかで記載]\n"
        "ingredients:\n"
        "- [材料名と量をスペースで区切って記載]\n"
        "- [材料名と量をスペースで区切って記載]\n"
        "steps:\n"
        "1. [調理手順を具体的に記載]\n"
        "2. [調理手順を具体的に記載]\n"
        "tips:\n"
        "- [調理のコツを具体的に記載]\n"
        "- [調理のコツを具体的に記載]\n\n"
        "注意事項：\n"
        "- 各セクションの開始を示すキーワード（name:, cooking_time:, difficulty:, ingredients:, steps:, tips:）は必ず記載してください\n"
        "- 材料は必ず「-」で始まる箇条書きにしてください\n"
        "- 手順は必ず番号付きリストにしてください\n"
        "- コツは必ず「-」で始まる箇条書きにしてください\n"
        "- 余分な装飾（##など）は使用しないでください"
    )

    # Gemini APIを使用してコンテンツを生成
    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content(prompt)
    
    print(f"Received response: {response.text}")

    # レスポンスのテキストを行ごとに分割
    lines = [line.strip() for line in response.text.split('\n') if line.strip()]
    
    # 各セクションの内容を格納する辞書
    recipe_data = {
        'name': '',
        'cooking_time': '',
        'difficulty': '',
        'ingredients': [],
        'steps': [],
        'tips': []
    }
    
    current_section = None
    
    # レスポンスを解析
    for line in lines:
        # 基本情報の処理
        if line.startswith('name:'):
            recipe_data['name'] = line.replace('name:', '').strip()
            continue
            
        if line.startswith('cooking_time:'):
            recipe_data['cooking_time'] = line.replace('cooking_time:', '').strip()
            continue
            
        if line.startswith('difficulty:'):
            recipe_data['difficulty'] = line.replace('difficulty:', '').strip()
            continue
            
        # セクション開始の検出
        if line == 'ingredients:':
            current_section = 'ingredients'
            continue
        elif line == 'steps:':
            current_section = 'steps'
            continue
        elif line == 'tips:':
            current_section = 'tips'
            continue
            
        # 各セクションの内容処理
        if current_section:
            if current_section == 'ingredients' and line.startswith('-'):
                # 材料の処理
                ingredient = line.replace('-', '').strip()
                recipe_data['ingredients'].append(ingredient)
                
            elif current_section == 'steps' and line[0].isdigit():
                # 手順の処理
                step = line.split('.', 1)[1].strip() if '.' in line else line
                recipe_data['steps'].append(step)
                
            elif current_section == 'tips' and line.startswith('-'):
                # コツの処理
                tip = line.replace('-', '').strip()
                recipe_data['tips'].append(tip)

    # デフォルト値の設定
    if not recipe_data['cooking_time']:
        recipe_data['cooking_time'] = cooking_time
    if not recipe_data['difficulty']:
        recipe_data['difficulty'] = difficulty

    # 最終的なレシピデータの作成
    recipes = [{
        "name": recipe_data['name'],
        "cooking_time": recipe_data['cooking_time'],
        "difficulty": recipe_data['difficulty'],
        "ingredients": recipe_data['ingredients'],
        "steps": recipe_data['steps'],
        "tips": recipe_data['tips']
    }]
    
    # レスポンスをログに出力
    logging.info(f"Retrieved recipes: {recipes}")
    
    return recipes