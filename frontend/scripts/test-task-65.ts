/**
 * ============================================================================
 * KIỂM ĐỊNH TỰ ĐỘNG TASK-65 (FE-S4-09):
 * KIỂM ĐỊNH BẢN DỰNG ĐÓNG GÓI PRODUCTION (ZERO-ERROR BUILD CERTIFICATION)
 * ============================================================================
 */

import { execSync } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { preview } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

let totalTests = 0;
let passedTests = 0;

function assert(condition: boolean, message: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ ${message}`);
  } else {
    console.error(`  ✗ THẤT BẠI: ${message}`);
    process.exitCode = 1;
  }
}

async function runTests() {
  console.log('\n======================================================================');
  console.log('   KIỂM ĐỊNH TỰ ĐỘNG TASK-65 (FE-S4-09): ZERO-ERROR PRODUCTION BUILD');
  console.log('======================================================================\n');

  // ----------------------------------------------------------------------------
  // 1. KIỂM ĐỊNH BIÊN DỊCH TĨNH TYPESCRIPT (DoD 1: tsc --noEmit 0 errors)
  // ----------------------------------------------------------------------------
  console.log('1. KIỂM ĐỊNH KIỂU DỮ LIỆU TĨNH TYPESCRIPT (DoD 1)');
  try {
    const startTime = Date.now();
    execSync('npm run lint', { cwd: rootDir, stdio: 'pipe' });
    const duration = Date.now() - startTime;
    assert(true, `Lệnh "npm run lint" (tsc --noEmit) hoàn thành sạch sẽ 0 lỗi (${duration}ms)`);
  } catch (err: any) {
    assert(false, `Lỗi biên dịch TypeScript: ${err.message}`);
  }

  // ----------------------------------------------------------------------------
  // 2. KIỂM ĐỊNH QUY TRÌNH ĐÓNG GÓI VITE BUILD (DoD 2: npm run build thành công)
  // ----------------------------------------------------------------------------
  console.log('\n2. KIỂM ĐỊNH QUY TRÌNH ĐÓNG GÓI VITE BUILD (DoD 2)');
  try {
    const startTime = Date.now();
    execSync('npm run build', { cwd: rootDir, stdio: 'pipe' });
    const duration = Date.now() - startTime;
    assert(fs.existsSync(distDir), `Lệnh "npm run build" tạo thư mục dist/ thành công (${duration}ms)`);
  } catch (err: any) {
    assert(false, `Lỗi đóng gói Vite build: ${err.message}`);
  }

  // ----------------------------------------------------------------------------
  // 3. KIỂM ĐỊNH TÍNH TOÀN VẸN VÀ BĂM MÃ TÀI NGUYÊN (DoD 3: Hashed Assets & HTML)
  // ----------------------------------------------------------------------------
  console.log('\n3. KIỂM ĐỊNH TÍNH TOÀN VẸN CÁC TÀI NGUYÊN TRONG DIST/ (DoD 3)');
  const indexPath = path.join(distDir, 'index.html');
  assert(fs.existsSync(indexPath), 'Tệp dist/index.html tồn tại hợp lệ');

  const indexContent = fs.readFileSync(indexPath, 'utf-8');
  assert(
    indexContent.includes('<!doctype html>') && indexContent.includes('id="root"'),
    'dist/index.html chứa cấu trúc DOM tiêu chuẩn và điểm gắn kết #root'
  );

  const assetsDir = path.join(distDir, 'assets');
  assert(fs.existsSync(assetsDir), 'Thư mục dist/assets tồn tại hợp lệ');

  const assetFiles = fs.readdirSync(assetsDir);
  const cssFiles = assetFiles.filter((f) => f.endsWith('.css'));
  const jsFiles = assetFiles.filter((f) => f.endsWith('.js'));

  assert(cssFiles.length >= 1, `Xuất xưởng ${cssFiles.length} tệp CSS được tối ưu và nén mã`);
  assert(jsFiles.length >= 3, `Xuất xưởng ${jsFiles.length} tệp JavaScript theo kiến trúc chia tách vendor`);

  // Kiểm tra tên tệp có băm mã (hashed filename, ví dụ index-DmtQAeJm.js)
  const isHashed = (name: string) => /-[a-zA-Z0-9_-]{8,}\.(js|css)$/.test(name);
  const allHashed = assetFiles.every(isHashed);
  assert(
    allHashed,
    '100% tệp trong dist/assets/ áp dụng cơ chế băm tên tệp (Hashed Filenames) chống lưu đệm cũ (Cache Busting)'
  );

  // Kiểm tra cấu hình preview trong vite.config.ts
  const viteConfigContent = fs.readFileSync(path.join(rootDir, 'vite.config.ts'), 'utf-8');
  assert(
    viteConfigContent.includes('preview:') && viteConfigContent.includes('port: 4173'),
    'vite.config.ts định hình cổng máy chủ xem trước preview cố định tại 4173'
  );

  // ----------------------------------------------------------------------------
  // 4. KIỂM THỬ MÁY CHỦ XEM TRƯỚC PREVIEW PORT 4173 (DoD 4: Live HTTP Probe)
  // ----------------------------------------------------------------------------
  console.log('\n4. KIỂM THỬ KHỞI CHẠY MÁY CHỦ XEM TRƯỚC (PREVIEW PORT 4173) (DoD 4)');

  const previewServer = await preview({
    root: rootDir,
    preview: {
      port: 4173,
      host: '127.0.0.1',
    },
  });

  const previewUrl = previewServer.resolvedUrls?.local[0] || 'http://127.0.0.1:4173/';

  await new Promise<void>((resolve) => {
    const req = http.get(previewUrl, (res) => {
      assert(res.statusCode === 200, `Máy chủ preview (${previewUrl}) phản hồi HTTP Status 200 OK (${res.statusCode})`);

      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        assert(data.includes('Nitro Grand Hotel'), 'Nội dung phản hồi từ cổng 4173 chứa tiêu đề Nitro Grand Hotel');
        assert(data.includes('id="root"'), 'Nội dung phản hồi chứa đầy đủ thẻ root sẵn sàng mount React Virtual DOM');
        resolve();
      });
    });

    req.on('error', (err) => {
      assert(false, `Kết nối máy chủ preview port 4173 thất bại: ${err.message}`);
      resolve();
    });
  });

  // Đóng tiến trình preview server
  previewServer.close();

  // ----------------------------------------------------------------------------
  // TỔNG KẾT
  // ----------------------------------------------------------------------------
  console.log('\n----------------------------------------------------------------------');
  console.log(`Kết quả: ${passedTests} bài kiểm tra thành công, ${totalTests - passedTests} bài thất bại.`);
  if (passedTests === totalTests) {
    console.log('🎉 TASK-65 (FE-S4-09) ĐẠT 100% TIÊU CHÍ NGHIỆM THU (DEFINITION OF DONE)!\n');
  } else {
    console.error('❌ MỘT SỐ BÀI KIỂM TRA THẤT BẠI!\n');
  }
}

runTests();
