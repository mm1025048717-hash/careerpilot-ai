"""测试页面选择器"""
from playwright.sync_api import sync_playwright
import time
import json
import os

# 加载 Cookie
cookie_path = os.path.join(os.path.dirname(__file__), 'cookies.json')

p = sync_playwright().start()
browser = p.chromium.launch(headless=False)
context = browser.new_context()

if os.path.exists(cookie_path):
    with open(cookie_path, 'r') as f:
        cookies = json.load(f)
        if cookies:
            context.add_cookies(cookies)
            print('已加载 Cookie')

page = context.new_page()

print('访问搜索页...')
page.goto('https://www.zhipin.com/web/geek/job?query=产品经理&city=101020100')
time.sleep(5)

print('\n页面 URL:', page.url)
print('\n查找职位卡片...')

# 尝试不同的选择器
selectors = [
    '.job-card-wrapper',
    '.job-card-body', 
    '.job-list-box li',
    '.search-job-result li',
    '[class*="job-card"]',
    '.job-title',
    '.job-name',
    'li.job-card-box',
    '.search-job-result .job-card-box'
]

for sel in selectors:
    try:
        els = page.query_selector_all(sel)
        print(f'  {sel}: 找到 {len(els)} 个')
    except:
        print(f'  {sel}: 查询失败')

# 截图保存
page.screenshot(path='search_result.png')
print('\n截图已保存: search_result.png')

input('\n按 Enter 关闭浏览器...')

browser.close()
p.stop()


