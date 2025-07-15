import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'es' | 'fr' | 'de' | 'pt' | 'it' | 'ja' | 'ko' | 'zh';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Header
    'app.title': 'StudyFlow',
    'app.subtitle': 'AI-Powered Student Productivity',
    'header.studyMode': 'Study Mode',
    'header.signIn': 'Sign In',
    'header.signOut': 'Sign Out',
    'header.overdue': 'overdue',
    'header.dueToday': 'due today',
    
    // Main sections
    'section.tasks': 'Tasks',
    'section.progress': 'Progress',
    'section.timer': 'Focus Timer',
    'section.studyLinks': 'Study Links',
    'section.quickNotes': 'Quick Notes',
    'section.prioritization': 'Task Prioritization',
    
    // Common actions
    'action.add': 'Add',
    'action.edit': 'Edit',
    'action.delete': 'Delete',
    'action.save': 'Save',
    'action.cancel': 'Cancel',
    'action.complete': 'Complete',
    'action.start': 'Start',
    'action.pause': 'Pause',
    'action.stop': 'Stop',
    'action.reset': 'Reset',
    
    // Task related
    'task.new': 'New Task',
    'task.title': 'Task Title',
    'task.description': 'Description',
    'task.priority': 'Priority',
    'task.dueDate': 'Due Date',
    'task.completed': 'Completed',
    'task.pending': 'Pending',
  },
  es: {
    // Header
    'app.title': 'StudyFlow',
    'app.subtitle': 'Productividad Estudiantil con IA',
    'header.studyMode': 'Modo Estudio',
    'header.signIn': 'Iniciar Sesión',
    'header.signOut': 'Cerrar Sesión',
    'header.overdue': 'vencido',
    'header.dueToday': 'vence hoy',
    
    // Main sections
    'section.tasks': 'Tareas',
    'section.progress': 'Progreso',
    'section.timer': 'Temporizador de Enfoque',
    'section.studyLinks': 'Enlaces de Estudio',
    'section.quickNotes': 'Notas Rápidas',
    'section.prioritization': 'Priorización de Tareas',
    
    // Common actions
    'action.add': 'Agregar',
    'action.edit': 'Editar',
    'action.delete': 'Eliminar',
    'action.save': 'Guardar',
    'action.cancel': 'Cancelar',
    'action.complete': 'Completar',
    'action.start': 'Iniciar',
    'action.pause': 'Pausar',
    'action.stop': 'Detener',
    'action.reset': 'Reiniciar',
    
    // Task related
    'task.new': 'Nueva Tarea',
    'task.title': 'Título de Tarea',
    'task.description': 'Descripción',
    'task.priority': 'Prioridad',
    'task.dueDate': 'Fecha de Vencimiento',
    'task.completed': 'Completada',
    'task.pending': 'Pendiente',
  },
  fr: {
    // Header
    'app.title': 'StudyFlow',
    'app.subtitle': 'Productivité Étudiante Alimentée par IA',
    'header.studyMode': 'Mode Étude',
    'header.signIn': 'Se Connecter',
    'header.signOut': 'Se Déconnecter',
    'header.overdue': 'en retard',
    'header.dueToday': 'dû aujourd\'hui',
    
    // Main sections
    'section.tasks': 'Tâches',
    'section.progress': 'Progrès',
    'section.timer': 'Minuteur de Focus',
    'section.studyLinks': 'Liens d\'Étude',
    'section.quickNotes': 'Notes Rapides',
    'section.prioritization': 'Priorisation des Tâches',
    
    // Common actions
    'action.add': 'Ajouter',
    'action.edit': 'Modifier',
    'action.delete': 'Supprimer',
    'action.save': 'Sauvegarder',
    'action.cancel': 'Annuler',
    'action.complete': 'Terminer',
    'action.start': 'Démarrer',
    'action.pause': 'Pause',
    'action.stop': 'Arrêter',
    'action.reset': 'Réinitialiser',
    
    // Task related
    'task.new': 'Nouvelle Tâche',
    'task.title': 'Titre de Tâche',
    'task.description': 'Description',
    'task.priority': 'Priorité',
    'task.dueDate': 'Date d\'Échéance',
    'task.completed': 'Terminée',
    'task.pending': 'En Attente',
  },
  de: {
    // Header
    'app.title': 'StudyFlow',
    'app.subtitle': 'KI-gestützte Studentenproduktivität',
    'header.studyMode': 'Lernmodus',
    'header.signIn': 'Anmelden',
    'header.signOut': 'Abmelden',
    'header.overdue': 'überfällig',
    'header.dueToday': 'heute fällig',
    
    // Main sections
    'section.tasks': 'Aufgaben',
    'section.progress': 'Fortschritt',
    'section.timer': 'Fokus-Timer',
    'section.studyLinks': 'Lernlinks',
    'section.quickNotes': 'Schnelle Notizen',
    'section.prioritization': 'Aufgabenpriorisierung',
    
    // Common actions
    'action.add': 'Hinzufügen',
    'action.edit': 'Bearbeiten',
    'action.delete': 'Löschen',
    'action.save': 'Speichern',
    'action.cancel': 'Abbrechen',
    'action.complete': 'Abschließen',
    'action.start': 'Starten',
    'action.pause': 'Pausieren',
    'action.stop': 'Stoppen',
    'action.reset': 'Zurücksetzen',
    
    // Task related
    'task.new': 'Neue Aufgabe',
    'task.title': 'Aufgabentitel',
    'task.description': 'Beschreibung',
    'task.priority': 'Priorität',
    'task.dueDate': 'Fälligkeitsdatum',
    'task.completed': 'Abgeschlossen',
    'task.pending': 'Ausstehend',
  },
  pt: {
    // Header
    'app.title': 'StudyFlow',
    'app.subtitle': 'Produtividade Estudantil com IA',
    'header.studyMode': 'Modo Estudo',
    'header.signIn': 'Entrar',
    'header.signOut': 'Sair',
    'header.overdue': 'atrasado',
    'header.dueToday': 'vence hoje',
    
    // Main sections
    'section.tasks': 'Tarefas',
    'section.progress': 'Progresso',
    'section.timer': 'Timer de Foco',
    'section.studyLinks': 'Links de Estudo',
    'section.quickNotes': 'Notas Rápidas',
    'section.prioritization': 'Priorização de Tarefas',
    
    // Common actions
    'action.add': 'Adicionar',
    'action.edit': 'Editar',
    'action.delete': 'Excluir',
    'action.save': 'Salvar',
    'action.cancel': 'Cancelar',
    'action.complete': 'Completar',
    'action.start': 'Iniciar',
    'action.pause': 'Pausar',
    'action.stop': 'Parar',
    'action.reset': 'Reiniciar',
    
    // Task related
    'task.new': 'Nova Tarefa',
    'task.title': 'Título da Tarefa',
    'task.description': 'Descrição',
    'task.priority': 'Prioridade',
    'task.dueDate': 'Data de Vencimento',
    'task.completed': 'Concluída',
    'task.pending': 'Pendente',
  },
  it: {
    // Header
    'app.title': 'StudyFlow',
    'app.subtitle': 'Produttività Studentesca Alimentata da IA',
    'header.studyMode': 'Modalità Studio',
    'header.signIn': 'Accedi',
    'header.signOut': 'Esci',
    'header.overdue': 'scaduto',
    'header.dueToday': 'scade oggi',
    
    // Main sections
    'section.tasks': 'Compiti',
    'section.progress': 'Progresso',
    'section.timer': 'Timer di Concentrazione',
    'section.studyLinks': 'Link di Studio',
    'section.quickNotes': 'Note Veloci',
    'section.prioritization': 'Prioritizzazione Compiti',
    
    // Common actions
    'action.add': 'Aggiungi',
    'action.edit': 'Modifica',
    'action.delete': 'Elimina',
    'action.save': 'Salva',
    'action.cancel': 'Annulla',
    'action.complete': 'Completa',
    'action.start': 'Avvia',
    'action.pause': 'Pausa',
    'action.stop': 'Ferma',
    'action.reset': 'Reimposta',
    
    // Task related
    'task.new': 'Nuovo Compito',
    'task.title': 'Titolo Compito',
    'task.description': 'Descrizione',
    'task.priority': 'Priorità',
    'task.dueDate': 'Data di Scadenza',
    'task.completed': 'Completato',
    'task.pending': 'In Attesa',
  },
  ja: {
    // Header
    'app.title': 'StudyFlow',
    'app.subtitle': 'AI搭載学生生産性',
    'header.studyMode': '学習モード',
    'header.signIn': 'サインイン',
    'header.signOut': 'サインアウト',
    'header.overdue': '期限切れ',
    'header.dueToday': '今日期限',
    
    // Main sections
    'section.tasks': 'タスク',
    'section.progress': '進捗',
    'section.timer': '集中タイマー',
    'section.studyLinks': '学習リンク',
    'section.quickNotes': 'クイックノート',
    'section.prioritization': 'タスク優先順位',
    
    // Common actions
    'action.add': '追加',
    'action.edit': '編集',
    'action.delete': '削除',
    'action.save': '保存',
    'action.cancel': 'キャンセル',
    'action.complete': '完了',
    'action.start': '開始',
    'action.pause': '一時停止',
    'action.stop': '停止',
    'action.reset': 'リセット',
    
    // Task related
    'task.new': '新しいタスク',
    'task.title': 'タスクタイトル',
    'task.description': '説明',
    'task.priority': '優先度',
    'task.dueDate': '期限',
    'task.completed': '完了',
    'task.pending': '保留中',
  },
  ko: {
    // Header
    'app.title': 'StudyFlow',
    'app.subtitle': 'AI 기반 학생 생산성',
    'header.studyMode': '학습 모드',
    'header.signIn': '로그인',
    'header.signOut': '로그아웃',
    'header.overdue': '연체',
    'header.dueToday': '오늘 만료',
    
    // Main sections
    'section.tasks': '작업',
    'section.progress': '진행 상황',
    'section.timer': '집중 타이머',
    'section.studyLinks': '학습 링크',
    'section.quickNotes': '빠른 노트',
    'section.prioritization': '작업 우선순위',
    
    // Common actions
    'action.add': '추가',
    'action.edit': '편집',
    'action.delete': '삭제',
    'action.save': '저장',
    'action.cancel': '취소',
    'action.complete': '완료',
    'action.start': '시작',
    'action.pause': '일시 정지',
    'action.stop': '중지',
    'action.reset': '재설정',
    
    // Task related
    'task.new': '새 작업',
    'task.title': '작업 제목',
    'task.description': '설명',
    'task.priority': '우선순위',
    'task.dueDate': '마감일',
    'task.completed': '완료됨',
    'task.pending': '대기 중',
  },
  zh: {
    // Header
    'app.title': 'StudyFlow',
    'app.subtitle': 'AI驱动的学生生产力',
    'header.studyMode': '学习模式',
    'header.signIn': '登录',
    'header.signOut': '退出',
    'header.overdue': '逾期',
    'header.dueToday': '今日到期',
    
    // Main sections
    'section.tasks': '任务',
    'section.progress': '进度',
    'section.timer': '专注计时器',
    'section.studyLinks': '学习链接',
    'section.quickNotes': '快速笔记',
    'section.prioritization': '任务优先级',
    
    // Common actions
    'action.add': '添加',
    'action.edit': '编辑',
    'action.delete': '删除',
    'action.save': '保存',
    'action.cancel': '取消',
    'action.complete': '完成',
    'action.start': '开始',
    'action.pause': '暂停',
    'action.stop': '停止',
    'action.reset': '重置',
    
    // Task related
    'task.new': '新任务',
    'task.title': '任务标题',
    'task.description': '描述',
    'task.priority': '优先级',
    'task.dueDate': '截止日期',
    'task.completed': '已完成',
    'task.pending': '待处理',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('studyflow-language');
    return (saved as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('studyflow-language', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}