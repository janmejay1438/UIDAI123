import requests

try:
    r = requests.get('http://127.0.0.1:5000/api/analytics/states?period=monthly')
    data = r.json()
    print(f'Total states: {len(data)}')
    print('\nTop 5 states by enrolments:')
    for s in sorted(data, key=lambda x: x.get('total_enrolments', 0), reverse=True)[:5]:
        enrol = s.get('total_enrolments', 0)
        updates = s.get('total_updates', 0)
        print(f"  {s['state']}: {enrol:,} enrolments, {updates:,} updates")
except Exception as e:
    print(f'Error: {e}')
