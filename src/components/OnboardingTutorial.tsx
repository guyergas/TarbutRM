"use client";

import { useState } from "react";

interface OnboardingTutorialProps {
  onComplete?: () => void;
  onSkip?: () => void;
  role?: string;
}

export default function OnboardingTutorial({
  onComplete,
  onSkip,
  role,
}: OnboardingTutorialProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const basicSlides = [
    {
      title: "ברוכים הבאים לאתר תרבות רמות מנשה!",
      description: "מערכת זו תוכננה למטרה פשוטה - ניהול הזמנות באירועי תרבות רמות מנשה",
      content: (
        <div className="h-48 bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-indigo-900 dark:to-blue-900 rounded-lg flex items-center justify-center">
          <svg className="w-24 h-24 text-indigo-600 dark:text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
      ),
    },
    {
      title: "תקציב וארנק",
      description: [
        "בתפריט העליון תראו את התקציב הנוכחי שלכם",
        "לחצו על התקציב כדי לפתוח את הארנק",
        "בארנק תוכלו להגדיל את ההשקעה שלכם בקליק",
      ],
      content: (
        <div className="h-48 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-lg flex items-center justify-center">
          <svg className="w-24 h-24 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 1C6.48 1 2 5.48 2 11s4.48 10 10 10 10-4.48 10-10S17.52 1 12 1zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 6 15.5 6 14 6.67 14 7.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 6 8.5 6 7 6.67 7 7.5 7.67 9 8.5 9zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
          </svg>
        </div>
      ),
    },
    {
      title: "חנות ובחירת מוצרים",
      description: [
        "לחצו על הבית כדי לחזור לחנות",
        "דפדפו בין התפריטים השונים כדי למצוא את המוצר שאתה מחפשים",
        "בחרו את הכמות המבוקשת",
        "לחצו על 'הוסף לסל' כדי להוסיף את המוצר",
      ],
      content: (
        <div className="h-48 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900 rounded-lg flex items-center justify-center">
          <svg className="w-24 h-24 text-orange-600 dark:text-orange-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
          </svg>
        </div>
      ),
    },
    {
      title: "סל קניות",
      description: [
        "צפו בסל הקניות שלכם על ידי לחיצה על סמל העגלה בעמודה העליונה",
        "בסל תוכלו לראות את כל הפריטים שלכם",
        "תוכלו לשנות את הכמות של כל פריט באמצעות כפתורי + ו-",
        "או להסיר פריטים שלא רוצים",
      ],
      content: (
        <div className="h-48 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-lg flex items-center justify-center">
          <svg className="w-24 h-24 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
          </svg>
        </div>
      ),
    },
    {
      title: "יצירת הזמנה",
      description: [
        "כשתסיימו לבחור פריטים, בדקו את הרשימה שלכם",
        "לחצו על 'המשך לתשלום' כדי ליצור הזמנה",
        "אשרו את פרטי ההזמנה וממשיכו",
        "ההזמנה תרשם בחשבון שלכם",
      ],
      content: (
        <div className="h-48 bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900 dark:to-blue-900 rounded-lg flex items-center justify-center">
          <svg className="w-24 h-24 text-cyan-600 dark:text-cyan-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
          </svg>
        </div>
      ),
    },
    {
      title: "מעקב הזמנה",
      description: [
        "לאחר ביצוע הזמנה, תועברו אוטומטית לדף ההזמנה. אתם יכולים לחזור לראות את כל ההזמנות בכל רגע על ידי לחיצה על 'ההזמנות שלי' בתפריט",
        "כל הזמנה מציגה את הסטטוס שלה (בהכנה, מוכנה, בעיצומה וכו')",
        "לאחר קבלת ההזמנה, תוכלו ללחוץ על 'העבר להושלם' כדי לסגור את ההזמנה",
        "הזמנות סגורות יוצגו בטבלה נפרדת",
      ],
      content: (
        <div className="h-48 bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900 dark:to-cyan-900 rounded-lg flex items-center justify-center">
          <svg className="w-24 h-24 text-teal-600 dark:text-teal-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
      ),
    },
    {
      title: "סיום / המשך לעמקות",
      description: [
        "🎉 כל הכבוד! למדתם את הדרך הבסיסית להשתמש במערכת",
        "תוכלו ללחוץ על 'סיום' כדי לסיים את התרגיל",
        "או 'המשך לעמקות' כדי ללמוד עוד עקרונות מתקדמים",
      ],
      content: (
        <div className="h-48 bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900 dark:to-orange-900 rounded-lg flex items-center justify-center">
          <svg className="w-24 h-24 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
      ),
    },
  ];

  const advancedSlides = [
    {
      title: "סטטוסי הזמנה",
      description: [
        "חדש: ההזמנה נקלטה וממתינה לעיבוד",
        "בעיבוד: ההזמנה מעובדת ובהכנה",
        "הושלם: ההזמנה הושלמה ומוכנה למסירה",
        "הסטטוס משתנה אוטומטית כשעדכונים מתקבלים",
      ],
      content: (
        <div className="h-48 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-lg flex items-center justify-center">
          <svg className="w-24 h-24 text-indigo-600 dark:text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
      ),
    },
    {
      title: "עדכון פרטים",
      description: [
        "לחצו על פרופיל בפינה העליונה",
        "בהגדרות תוכלו לשנות גם מידע אישי",
        "תוכלו גם לאפס את הסיסמא שלכם משם",
        "כל הנתונים שלכם מוגנים ובטוחים",
      ],
      content: (
        <div className="h-48 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900 rounded-lg flex items-center justify-center">
          <svg className="w-24 h-24 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </div>
      ),
    },
    {
      title: "בעיות נפוצות",
      description: [
        "❌ לא קיבלתי את ההזמנה שלי? בדקו את הסטטוס בדף ההזמנות",
        "❌ שכחתי את הסיסמא? השתמשו בקישור 'איפוס סיסמא' בדף ההתחברות",
        "❌ רוצה לשנות כמות? ערכו את הכמות בסל לפני שתשלמו",
        "❌ השאלה שלך לא כאן? בדוק את אפשרות העזרה הבאה",
      ],
      content: (
        <div className="h-48 bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900 dark:to-orange-900 rounded-lg flex items-center justify-center">
          <svg className="w-24 h-24 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
        </div>
      ),
    },
    {
      title: "עזרה נוספת",
      description: [
        "יש לכם שאלה או בעיה?",
        "לחצו על 'צור קשר' בתפריט הראשי",
        "שם תוכלו להשאיר הודעה ואנחנו נחזור אליכם בקרוב",
        "אנחנו כאן כדי לעזור!",
      ],
      content: (
        <div className="h-48 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-lg flex items-center justify-center">
          <svg className="w-24 h-24 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
          </svg>
        </div>
      ),
    },
  ];

  const staffSlides = [
    {
      title: "ניהול מלאי",
      description: [
        "לחצו על מוצר בחנות כדי לערוך אותו",
        "עדכנו את המלאי - 'זמין' או 'אזל'",
        "בעדכון מלאי, המוצר יוצג/יוסתר בחנות",
        "משתמשים לא יוכלו להזמין מוצרים שאינם זמינים",
      ],
      content: (
        <div className="h-48 bg-gradient-to-br from-slate-100 to-gray-100 dark:from-slate-900 dark:to-gray-900 rounded-lg flex items-center justify-center">
          <svg className="w-24 h-24 text-slate-600 dark:text-slate-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
        </div>
      ),
    },
    {
      title: "טיפול בתור ההזמנות",
      description: [
        "לחצו על 'תור ההזמנות' בתפריט העליון",
        "ראו את כל ההזמנות הפתוחות בסדר קבלה",
        "עדכנו את סטטוס ההזמנה: בהכנה → בעיצומה → מוכנה",
        "משתמשים יראו את העדכונים בזמן אמת",
      ],
      content: (
        <div className="h-48 bg-gradient-to-br from-amber-100 to-yellow-100 dark:from-amber-900 dark:to-yellow-900 rounded-lg flex items-center justify-center">
          <svg className="w-24 h-24 text-amber-600 dark:text-amber-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
        </div>
      ),
    },
  ];

  const slides = showAdvanced ? (role === "ADMIN" || role === "STAFF" ? [...advancedSlides, ...staffSlides] : advancedSlides) : basicSlides;
  const safeCurrentSlide = Math.min(currentSlide, slides.length - 1);
  const slide = slides[safeCurrentSlide];
  const totalSlides = slides.length;
  const isLastBasicSlide = !showAdvanced && safeCurrentSlide === basicSlides.length - 1;
  const isLastSlide = safeCurrentSlide === slides.length - 1;

  const handleNext = () => {
    if (isLastBasicSlide) {
      // Show advanced slides next button
      setShowAdvanced(true);
      setCurrentSlide(0);
    } else if (!isLastSlide) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handlePrevious = () => {
    if (showAdvanced && currentSlide === 0) {
      // Go back to basic slides
      setShowAdvanced(false);
      setCurrentSlide(basicSlides.length - 1);
    } else if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleDone = () => {
    if (onComplete) {
      onComplete();
    }
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    }
  };

  const handleContinueAdvanced = () => {
    setShowAdvanced(true);
    setCurrentSlide(0);
  };

  const progressText = `${safeCurrentSlide + 1} מתוך ${totalSlides}`;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto rtl">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            {progressText}
          </span>
          <button
            onClick={handleSkip}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-right">
            {slide.title}
          </h2>

          {slide.content}

          <div className="space-y-3 text-right">
            {typeof slide.description === "string" ? (
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                {slide.description}
              </p>
            ) : (
              <ul className="space-y-2">
                {slide.description.map((item, idx) => (
                  <li
                    key={idx}
                    className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed flex items-start gap-2"
                  >
                    <span className="text-indigo-600 dark:text-indigo-400 flex-shrink-0">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 space-y-3">
          {isLastBasicSlide && !showAdvanced ? (
            <>
              <button
                onClick={handleDone}
                className="w-full rounded-md bg-indigo-600 dark:bg-indigo-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 dark:hover:bg-indigo-600 transition"
              >
                סיום
              </button>
              <button
                onClick={handleContinueAdvanced}
                className="w-full rounded-md border border-indigo-600 dark:border-indigo-500 px-4 py-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition"
              >
                המשך לעמקות
              </button>
            </>
          ) : isLastSlide && showAdvanced ? (
            <button
              onClick={handleDone}
              className="w-full rounded-md bg-indigo-600 dark:bg-indigo-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 dark:hover:bg-indigo-600 transition"
            >
              סיום
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={handlePrevious}
                disabled={currentSlide === 0 && !showAdvanced}
                className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                הקודם
              </button>
              <button
                onClick={handleNext}
                className="flex-1 rounded-md bg-indigo-600 dark:bg-indigo-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 dark:hover:bg-indigo-600 transition"
              >
                הבא
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
