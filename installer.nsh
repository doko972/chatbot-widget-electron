; Script NSIS personnalisé pour Chatbot HR Télécoms
; Ajoutez des personnalisations supplémentaires ici si nécessaire

!macro customHeader
  !system "echo 'Configuration installateur HR Télécoms'"
!macroend

!macro customInstall
  ; Créer un raccourci sur le bureau
  CreateShortCut "$DESKTOP\Chatbot HR Télécoms.lnk" "$INSTDIR\${APP_EXECUTABLE_FILENAME}"
  
  ; Message de bienvenue après installation
  MessageBox MB_OK "Chatbot HR Télécoms a été installé avec succès !$\n$\nVous pouvez maintenant lancer l'application depuis le menu Démarrer ou le bureau.$\n$\nPour toute assistance : 02.31.43.50.11"
!macroend

!macro customUnInstall
  ; Supprimer le raccourci du bureau
  Delete "$DESKTOP\Chatbot HR Télécoms.lnk"
  
  ; Message de désinstallation
  MessageBox MB_YESNO "Souhaitez-vous conserver vos paramètres de configuration ?" IDYES keepSettings
    RMDir /r "$APPDATA\chatbot-widget-windows"
  keepSettings:
!macroend
