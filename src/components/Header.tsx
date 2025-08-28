@@ .. @@
     <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed font-light">
-      {t('app.description', {
-        security: <span className="font-semibold text-blue-600 dark:text-blue-400">{t('app.security')}</span>,
-        privacy: <span className="font-semibold text-purple-600 dark:text-purple-400">{t('app.privacy')}</span>
-      })}
+      <span dangerouslySetInnerHTML={{
+        __html: t('app.description')
+          .replace('{{security}}', `<span class="font-semibold text-blue-600 dark:text-blue-400">${t('app.security')}</span>`)
+          .replace('{{privacy}}', `<span class="font-semibold text-purple-600 dark:text-purple-400">${t('app.privacy')}</span>`)
+      }} />
     </p>