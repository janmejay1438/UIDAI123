import requests

try:
    r = requests.get('http://127.0.0.1:5000/api/analytics/states?period=monthly')
    data = r.json()
    print(f'Total states after normalization: {len(data)}')
    print('\nAll states:')
    for s in sorted(data, key=lambda x: x['state']):
        print(f"  - {s['state']}")
except Exception as e:
    print(f'Error: {e}')
