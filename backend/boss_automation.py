"""
BOSS直聘自动化 - 核心执行器
"""
from playwright.sync_api import sync_playwright
import time
import json
import os

class BossAutomation:
    def __init__(self):
        self.browser = None
        self.page = None
        self.context = None
        self.playwright = None
        self.config_path = os.path.join(os.path.dirname(__file__), 'user_config.json')
        self.cookie_path = os.path.join(os.path.dirname(__file__), 'cookies.json')
        
    def load_config(self):
        if os.path.exists(self.config_path):
            with open(self.config_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {}
        
    def save_config(self, config):
        with open(self.config_path, 'w', encoding='utf-8') as f:
            json.dump(config, f, ensure_ascii=False, indent=2)

    def start(self):
        """启动浏览器"""
        print('\n🚀 启动浏览器...')
        self.playwright = sync_playwright().start()
        
        self.browser = self.playwright.chromium.launch(
            headless=False,
            args=[
                '--start-maximized',
                '--disable-blink-features=AutomationControlled',
                '--no-sandbox'
            ]
        )
        
        self.context = self.browser.new_context(
            viewport={'width': 1280, 'height': 900},
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36'
        )
        
        # 加载已保存的 Cookie
        if os.path.exists(self.cookie_path):
            try:
                with open(self.cookie_path, 'r') as f:
                    cookies = json.load(f)
                    if cookies:
                        self.context.add_cookies(cookies)
                        print('✅ 已加载登录凭证')
            except:
                pass
                
        self.page = self.context.new_page()
        self.page.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        print('✅ 浏览器已就绪\n')
        
    def stop(self):
        """关闭浏览器"""
        try:
            if self.context:
                cookies = self.context.cookies()
                with open(self.cookie_path, 'w') as f:
                    json.dump(cookies, f)
                print('💾 登录状态已保存')
        except:
            pass
        if self.browser:
            self.browser.close()
        if self.playwright:
            self.playwright.stop()
        print('✅ 浏览器已关闭')

    def is_logged_in(self):
        """检查是否已登录"""
        try:
            time.sleep(1)
            
            # 方法1: 检查是否有用户头像
            avatar = self.page.query_selector('.user-nav img, .nav-figure img, .user-info')
            if avatar:
                print('   ✅ 检测到用户头像，已登录')
                return True
            
            # 方法2: 检查是否有"我的"或个人中心链接
            my_link = self.page.query_selector('a:has-text("我的"), .user-nav')
            if my_link:
                print('   ✅ 检测到个人中心，已登录')
                return True
            
            # 方法3: 检查是否能访问求职者页面
            if '/web/geek/' in self.page.url and 'login' not in self.page.url:
                # 检查页面是否有登录提示
                login_tip = self.page.query_selector('text=登录后查看, text=请登录')
                if not login_tip:
                    # 再检查一下是否有职位列表
                    jobs = self.page.query_selector('.job-card-wrapper, .job-list')
                    if jobs:
                        print('   ✅ 可以查看职位列表，已登录')
                        return True
            
            print('   ⚠️ 未检测到登录状态')
            return False
            
        except Exception as e:
            print(f'   ⚠️ 登录检测出错: {e}')
            return False

    def login(self):
        """登录流程"""
        config = self.load_config()
        phone = config.get('bossPhone', '') or config.get('bossAccount', '')
        
        print('\n' + '='*55)
        print('🔐 开始 BOSS 直聘登录流程')
        print('='*55)
        
        # 跳转到登录页
        print('\n📍 正在打开登录页面...')
        try:
            self.page.goto('https://www.zhipin.com/web/user/?ka=header-login', timeout=30000)
            time.sleep(3)
            print('   ✅ 登录页面已打开')
        except Exception as e:
            print(f'   ❌ 无法加载登录页面: {e}')
            return False
        
        # 自动填入手机号
        if phone:
            print(f'\n📱 自动填入手机号: {phone[:3]}****{phone[-4:]}')
            try:
                # 尝试点击"短信验证码登录"标签
                time.sleep(1)
                sms_tabs = self.page.query_selector_all('[ka="smslogin"], .sms-login, text=短信登录')
                for tab in sms_tabs:
                    try:
                        tab.click()
                        time.sleep(1)
                        print('   ✅ 已切换到短信登录')
                        break
                    except:
                        pass
                
                # 填入手机号
                phone_inputs = self.page.query_selector_all('input[name="phone"], input[placeholder*="手机"], input[type="tel"]')
                for phone_input in phone_inputs:
                    try:
                        phone_input.fill(phone)
                        print('   ✅ 手机号已填入')
                        time.sleep(1)
                        break
                    except:
                        pass
                
                # 点击发送验证码
                send_btns = self.page.query_selector_all('button:has-text("发送"), button:has-text("获取验证码"), .btn-sms')
                for btn in send_btns:
                    try:
                        if btn.is_visible():
                            btn.click()
                            print('   📨 验证码已发送！请查看手机短信')
                            break
                    except:
                        pass
                        
            except Exception as e:
                print(f'   ⚠️ 自动填入过程出错: {e}')
        
        print('\n' + '┌' + '─'*53 + '┐')
        print('│' + ' '*53 + '│')
        print('│   📱 请在浏览器中完成登录：                         │')
        print('│                                                     │')
        print('│   方式1: 输入手机收到的短信验证码                   │')
        print('│   方式2: 打开 BOSS 直聘 APP 扫描二维码              │')
        print('│                                                     │')
        print('│   ⏳ 系统正在等待您完成登录...                       │')
        print('│' + ' '*53 + '│')
        print('└' + '─'*53 + '┘\n')
        
        # 等待登录成功
        max_wait = 180  # 3分钟
        for i in range(max_wait // 2):
            time.sleep(2)
            
            try:
                current_url = self.page.url
                
                # 检查是否跳转离开登录页
                if 'login' not in current_url and 'user' not in current_url:
                    print('\n🔍 检测到页面跳转，验证登录状态...')
                    time.sleep(2)
                    
                    if self.is_logged_in():
                        print('\n✅ 登录成功！')
                        # 保存 Cookie
                        cookies = self.context.cookies()
                        with open(self.cookie_path, 'w') as f:
                            json.dump(cookies, f)
                        print('💾 登录凭证已保存，下次无需再登录')
                        
                        config['boss_logged_in'] = True
                        self.save_config(config)
                        return True
                
                # 检查是否在首页且已登录
                if 'zhipin.com' in current_url:
                    avatar = self.page.query_selector('.user-nav img, .nav-figure img')
                    if avatar:
                        print('\n✅ 登录成功！')
                        cookies = self.context.cookies()
                        with open(self.cookie_path, 'w') as f:
                            json.dump(cookies, f)
                        return True
                
            except:
                pass
            
            if i > 0 and i % 15 == 0:
                print(f'   ⏳ 已等待 {i * 2} 秒，请尽快完成登录...')
                
        print('\n❌ 登录超时（3分钟）')
        return False

    def ensure_logged_in(self):
        """确保已登录"""
        print('🌐 正在访问 BOSS 直聘...')
        
        try:
            self.page.goto('https://www.zhipin.com/web/geek/job', timeout=30000)
            time.sleep(3)
            print('   ✅ 页面已加载')
        except Exception as e:
            print(f'   ⚠️ 页面加载异常: {e}')
            # 即使超时也继续检查
        
        print('\n🔍 检查登录状态...')
        if not self.is_logged_in():
            print('   ⚠️ 需要登录')
            return self.login()
        else:
            print('   ✅ 已登录，可以继续')
            return True

    def search_jobs(self, keyword, city='北京'):
        """搜索职位"""
        city_codes = {
            '北京': '101010100', '上海': '101020100', '广州': '101280100',
            '深圳': '101280600', '杭州': '101210100', '成都': '101270100',
            '武汉': '101200100', '南京': '101190100', '西安': '101110100',
            '苏州': '101190400'
        }
        city_code = city_codes.get(city, '101010100')
        
        url = f'https://www.zhipin.com/web/geek/job?query={keyword}&city={city_code}'
        print(f'\n🔍 搜索职位: {keyword} @ {city}')
        print(f'   URL: {url}')
        
        try:
            self.page.goto(url, timeout=30000)
            time.sleep(3)
            print('   ✅ 搜索页面已加载')
        except Exception as e:
            print(f'   ⚠️ 加载异常: {e}')
        
        # 等待职位列表
        try:
            self.page.wait_for_selector('li.job-card-box, .job-card-wrapper', timeout=10000)
        except:
            # 可能需要登录
            if not self.is_logged_in():
                print('   ⚠️ 需要登录才能查看职位')
                if not self.login():
                    return []
                # 重新搜索
                self.page.goto(url, timeout=30000)
                time.sleep(3)
                try:
                    self.page.wait_for_selector('li.job-card-box, .job-card-wrapper', timeout=10000)
                except:
                    print('   ❌ 未找到职位列表')
                    return []
        
        # 使用新的选择器
        jobs = self.page.query_selector_all('li.job-card-box')
        if not jobs:
            jobs = self.page.query_selector_all('.job-card-wrapper')
        print(f'   📋 找到 {len(jobs)} 个职位')
        return jobs

    def apply_jobs(self, keyword, city='北京', count=5, progress_callback=None):
        """投递职位"""
        print('\n' + '='*55)
        print(f'🎯 开始投递: {keyword} @ {city}')
        print('='*55)
        
        if not self.ensure_logged_in():
            print('\n❌ 无法登录，任务终止')
            return 0
        
        jobs = self.search_jobs(keyword, city)
        if not jobs:
            print('\n❌ 没有找到职位')
            return 0
        
        total = min(len(jobs), count)
        success = 0
        
        print(f'\n📝 开始投递前 {total} 个职位...\n')
        
        for i, card in enumerate(jobs[:total]):
            try:
                if progress_callback:
                    progress_callback(int((i + 1) / total * 100), f'正在投递第 {i + 1}/{total} 个职位')
                
                # 获取职位信息
                title_el = card.query_selector('.job-name, .job-title')
                company_el = card.query_selector('.company-name, .info-company')
                salary_el = card.query_selector('.salary, .job-salary')
                
                title = title_el.inner_text() if title_el else '未知职位'
                company = company_el.inner_text() if company_el else '未知公司'
                salary = salary_el.inner_text() if salary_el else ''
                
                print(f'[{i+1}/{total}] {title} @ {company} {salary}')
                
                # 点击打开详情页
                with self.context.expect_page() as new_page_info:
                    card.click()
                
                new_page = new_page_info.value
                new_page.wait_for_load_state('domcontentloaded')
                time.sleep(2)
                
                # 查找沟通按钮
                chat_btn = new_page.query_selector('.btn-startchat, .op-btn-chat, button:has-text("立即沟通")')
                
                if chat_btn:
                    btn_text = chat_btn.inner_text()
                    if '继续沟通' in btn_text or '已沟通' in btn_text:
                        print(f'   ⏭️ 已沟通过，跳过')
                    else:
                        chat_btn.click()
                        success += 1
                        print(f'   ✅ 投递成功！')
                        time.sleep(2)
                else:
                    print(f'   ⚠️ 未找到沟通按钮')
                
                new_page.close()
                time.sleep(1)
                
            except Exception as e:
                print(f'   ❌ 出错: {e}')
                try:
                    # 尝试关闭可能打开的新页面
                    pages = self.context.pages
                    if len(pages) > 1:
                        pages[-1].close()
                except:
                    pass
        
        print(f'\n🎉 投递完成！成功 {success}/{total}')
        return success


def run_task(keyword, city, count=5, progress_callback=None):
    """执行投递任务"""
    bot = BossAutomation()
    try:
        bot.start()
        result = bot.apply_jobs(keyword, city, count, progress_callback)
        return result
    finally:
        bot.stop()


if __name__ == '__main__':
    print('\n' + '='*55)
    print('  BOSS 直聘自动投递 - 测试模式')
    print('='*55)
    
    bot = BossAutomation()
    try:
        bot.start()
        bot.apply_jobs('产品经理', '上海', 3)
    finally:
        bot.stop()
