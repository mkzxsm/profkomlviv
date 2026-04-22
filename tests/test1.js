import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate } from 'k6/metrics'; // Імпортуємо модуль для метрик

// --- 1. Визначення користувацьких метрик ---
// Вони з'являться в кінці звіту
const successRate = new Rate('custom_success_rate'); // % успішних (200 OK)
const under500ms = new Rate('req_under_500ms');      // % швидше 0.5с
const under1s = new Rate('req_under_1s');            // % швидше 1с
const under2s = new Rate('req_under_2s');            // % швидше 2с

export const options = {
  insecureSkipTLSVerify: true,
  stages: [
    { duration: '30s', target: 1000 },
    { duration: '1m', target: 2000 }, // Тримаємо 200 користувачів
    { duration: '20s', target: 0 },
  ],
  thresholds: {
    // Можна навіть ставити умови на ці нові метрики
    'custom_success_rate': ['rate>0.99'], // Успішність має бути > 99%
    'req_under_2s': ['rate>0.95'],        // 95% запитів мають бути швидше 2с
  },
};

// 👇 ВАШ ПОРТ (змініть на актуальний)
const BASE_URL = 'http://localhost:8080'; 

// Допоміжна функція для запису статистики
function trackMetrics(res) {
  // 1. Чи успішний запит?
  successRate.add(res.status === 200);
  
  // 2. Часові інтервали
  const duration = res.timings.duration; // Час у мілісекундах
  under500ms.add(duration < 500);
  under1s.add(duration < 1000);
  under2s.add(duration < 2000);
}

export default function () {
  
  group('News Endpoint', function () {
    const res = http.get(`${BASE_URL}/api/news`);
    
    check(res, {
      'status is 200': (r) => r.status === 200,
      'content present': (r) => r.body && r.body.length > 0,
    });
    
    trackMetrics(res); // <--- Записуємо статистику
  });

  sleep(1);

  group('Events Endpoint', function () {
    const res = http.get(`${BASE_URL}/api/events`);
    check(res, { 'status is 200': (r) => r.status === 200 });
    trackMetrics(res);
  });

  sleep(1);

  group('Team Endpoint', function () {
    const res = http.get(`${BASE_URL}/api/team`);
    check(res, { 'status is 200': (r) => r.status === 200 });
    trackMetrics(res);
  });

  sleep(1);

  group('Documents Endpoint', function () {
    const res = http.get(`${BASE_URL}/api/documents`);
    check(res, { 'status is 200': (r) => r.status === 200 });
    trackMetrics(res);
  });
}