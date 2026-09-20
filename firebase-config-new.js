/**
 * firebase-config-new.js
 * ملف تكوين Firebase جديد — منفصل عن الملف الأصلي (firebase-config.js).
 * لا يعدل ملفات الموقع الأصلية.
 *
 * محتويات هذا الملف:
 *   - كائن firebaseConfig (يجب تعويضه بإعدادات المشروع الحقيقية).
 *   - دالة initFirebaseApp() لتهيئة Firebase.
 *   - دالتي مساعدة getFirestore() و getAuth().
 *   - دالة testFirestoreConnection() للتحقق من الاتصال.
 *
 * تم تصميمه ليكون مكملًا لصفحة admin.html.
 */

// ---------------------------------------------------------------------------
// إعدادات Firebase — استبدل هذه القيم بإعدادات مشروعك الفعلية
// من Firebase Console > Project Settings > General > Your apps
// ---------------------------------------------------------------------------
const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT_ID.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId:             "YOUR_APP_ID",
  measurementId:     "YOUR_MEASUREMENT_ID"  // اختياري — Google Analytics for Firebase
};

/**
 * تهيئة تطبيق Firebase.
 * تُعيد مثيل التطبيق بعد التهيئة.
 */
function initFirebaseApp() {
  if (typeof firebase === 'undefined') {
    throw new Error(
      '[firebase-config-new] لم يتم تحميل Firebase SDK. ' +
      'تأكد من تضمين سكربت Firebase SDK قبل هذا الملف في HTML.'
    );
  }

  // منع التهيئة المزدوجة
  if (firebase.apps.length > 0) {
    console.log('[firebase-config-new] Firebase مُهيأ مسبقًا.');
    return firebase.app();
  }

  firebase.initializeApp(firebaseConfig);
  console.log('[firebase-config-new] تم تهيئة Firebase بنجاح.');
  return firebase.app();
}

/**
 * الحصول على مثيل Firestore.
 */
function getFirestore() {
  if (typeof firebase !== 'undefined' && firebase.firestore) {
    return firebase.firestore();
  }
  throw new Error('[firebase-config-new] firebase.firestore غير متاح — تأكد من تحميل SDK المناسب.');
}

/**
 * الحصول على مثيل Auth.
 */
function getAuth() {
  if (typeof firebase !== 'undefined' && firebase.auth) {
    return firebase.auth();
  }
  throw new Error('[firebase-config-new] firebase.auth غير متاح — تأكد من تحميل SDK المناسب.');
}

/**
 * التحقق من اتصال Firestore (مثال اختباري).
 * تُعيد وعدية بتقرير نجاح/فشل الاتصال.
 */
async function testFirestoreConnection() {
  try {
    const db = getFirestore();
    // محاولة قراءة مجموعة فارغة كاختبار للاتصال فقط
    await db.collection('_connection_test_').limit(1).get();
    return { success: true, message: 'الاتصال بـ Firestore يعمل بشكل طبيعي.' };
  } catch (err) {
    return {
      success: false,
      message: 'فشل الاتصال بـ Firestore: ' + err.message
    };
  }
}

// جعل الوظائف متاحة بصفتها متغيرات عامة في النافذة (عند التحميل كـ <script>)
if (typeof window !== 'undefined') {
  window.firebaseConfig            = firebaseConfig;
  window.initFirebaseApp          = initFirebaseApp;
  window.getFirestore             = getFirestore;
  window.getAuth                  = getAuth;
  window.testFirestoreConnection   = testFirestoreConnection;
}

// دعم التصدير كوحدة نمطية (module.exports) في حال استخدام البيئة Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    firebaseConfig,
    initFirebaseApp,
    getFirestore,
    getAuth,
    testFirestoreConnection
  };
}
