export type Texts = {
  capacityMatrix: {
    title?: string;
    searchPlaceholder?: string;
    onlyParticipants?: string;
    milestoneHeader: {
      incomeLabel: string;
      doneLabel: string;
      overflowPrefix: string;
      editButton: string;
      addMonthButton: string;
      addMonthBlocked: string;
    };
    roles: {
      pm: string;
      creative: string;
      inactive: string;
    };
    noLogs?: string;
    loggedTooltip: string;
    status?: {
      logged: string;
      none: string;
      over: string;
    };
    headers: {
      milestone?: string;
      person?: string;
      capacity?: string;
      assigned?: string;
      remaining?: string;
      loggedProject?: string;
      loggedTotal?: string;
      month: string;
      planned: string;
      value: string;
      logged: string;
      predictedCost: string;
      predictedProfit: string;
    };
    gotoEmployeeCapacity?: string;
  };
  projectHeader: {
    plan: string;
    logged: string;
    edit: string;
    responsible: string;
    manageUsers?: string;
  };
  kpis: {
    totalIncome: string;
    predictedCosts: string;
    predictedProfit: string;
  };
  pages: {
    monthlyOverview: {
      title: string;
      description: string;
    };
    myProjects: {
      title: string;
      description: string;
      pageTitle?: string;
      headerPM?: string;
      headerParticipation?: string;
      fallback?: string;
    };
  };
  milestoneModal: {
    title: string;
    nameLabel: string;
    incomeLabel: string;
    doneLabel: string;
    startMonthLabel: string;
    startYearLabel: string;
    cancel: string;
    save: string;
    saving: string;
  };
  monthCapacityModal: {
    title: string;
    plannedTotalLabel: string;
    remainingLabel: string;
    userPlannedLabel: string;
    cancel: string;
    save: string;
    saving: string;
    subtitle?: string;
    footerNote?: string;
    overflowSuffix?: string;
    removeMonthLabel?: string;
    removeConfirm?: string;
    removeError?: string;
  };
  projectUsersModal?: {
    title: string;
    loading: string;
    cancel: string;
    save: string;
    saving: string;
    close: string;
  };
  general: {
    reset?: string;
    loading: string;
    errorPrefix: string;
    notFound: string;
    welcome: string;
    appTitle: string;
    nav: {
      home: string;
      project: string;
      overview: string;
      myProjects: string;
    };
    previewOverviewDesc?: string;
    previewMyProjectsDesc?: string;
    previewProjectDesc?: string;
    openLabel?: string;
    loadingShort?: string;
    noProjectsShort?: string;
  };
};

export default function useTexts(): Texts {
  return {
    capacityMatrix: {
      milestoneHeader: {
        incomeLabel: "Příjem",
        doneLabel: "Hotovo",
        overflowPrefix: "Překročeno",
        editButton: "E",
        addMonthButton: "+m",
        addMonthBlocked:
          "Nelze přidat měsíc: překračuje datum ukončení milníku.",
      },
      noLogs: "Bez logů",
      loggedTooltip: "Zalogováno: {hours}h",
      status: {
        logged: "Zalogováno",
        none: "Bez logů",
        over: "Překročeno (logy > plán)",
      },
      roles: {
        pm: "PM",
        creative: "Kreativec",
        inactive: "Neaktivní",
      },
      headers: {
        milestone: "Milník",
        person: "Osoba",
        capacity: "Kapacita",
        assigned: "Přiděleno",
        remaining: "Zbývá",
        loggedProject: "Zalogováno (projekt)",
        loggedTotal: "Zalogováno (celkem)",
        month: "Měsíc",
        planned: "Plán (h)",
        value: "Hodnota (Kč)",
        logged: "Čerpáno",
        predictedCost: "Pred. náklad",
        predictedProfit: "Pred. zisk",
      },
      gotoEmployeeCapacity: "Přejít na kapacitu zaměstnanců",
      title: "Kapacita zaměstnanců — {month}/{year}",
      searchPlaceholder: "Hledat jméno",
      onlyParticipants: "Pouze účastníci projektu",
    },
    projectHeader: {
      plan: "Plán",
      logged: "Zalogováno",
      edit: "Editace",
      responsible: "Odpovědný PM:",
      manageUsers: "Správa účastníků",
    },
    kpis: {
      totalIncome: "Celkový příjem",
      predictedCosts: "Predikce nákladů",
      predictedProfit: "Predikce zisku",
    },
    pages: {
      monthlyOverview: {
        title: "Měsíční přehled — {month}/{year}",
        description:
          "Tabulka projektů a milníků pro vybraný měsíc se zobrazí zde.",
      },
      myProjects: {
        title: "Moje projekty — uživatel {userId}",
        description: "Osobní přehled projektů se zobrazí zde.",
        pageTitle: "Přehled mých projektů",
        headerPM: "Moje projekty (jako PM)",
        headerParticipation: "Projekty s mou účastí",
        fallback: "Žádné projekty k zobrazení.",
      },
    },
    milestoneModal: {
      title: "Upravit milník",
      nameLabel: "Název",
      incomeLabel: "Příjem",
      doneLabel: "Hotovo %",
      startMonthLabel: "Počáteční měsíc",
      startYearLabel: "Počáteční rok",
      cancel: "Zrušit",
      save: "Uložit",
      saving: "Ukládám...",
    },
    monthCapacityModal: {
      title: "Editace kapacity",
      plannedTotalLabel: "Plánovaná kapacita (h)",
      remainingLabel: "Zbývá (h)",
      userPlannedLabel: "Plán (h)",
      cancel: "Zrušit",
      save: "Uložit změny",
      saving: "Ukládám...",
      subtitle: "Nastavení plánované kapacity a rozdělení mezi pracovníky",
      footerNote: "Změny se projeví po uložení",
      overflowSuffix: "(překročeno)",
      removeMonthLabel: "Odstranit měsíc",
      removeConfirm:
        "Opravdu chcete odstranit tento měsíc? Tato akce smaže plánované i zalogované záznamy pro tento měsíc.",
      removeError: "Chyba při odstraňování měsíce",
    },
    projectUsersModal: {
      title: "Správa účastníků projektu",
      loading: "Načítání…",
      cancel: "Zrušit",
      save: "Uložit",
      saving: "Ukládám…",
      close: "Zavřít",
    },
    general: {
      previewOverviewDesc: "Rychlý náhled kapacit a vytížení",
      previewMyProjectsDesc: "Projekty, kde jste PM nebo účastník",
      previewProjectDesc: "Přejít na detail projektu",
      openLabel: "Otevřít",
      loadingShort: "Načítám…",
      noProjectsShort: "Žádné projekty",
      loading: "Načítám projekt...",
      errorPrefix: "Chyba:",
      notFound: "Projekt nenalezen",
      welcome: "Vítejte — zde můžete začít pracovat na projektu.",
      appTitle: "mlog-pm",
      nav: {
        home: "Domů",
        project: "Projekt",
        overview: "Měsíční přehled",
        myProjects: "Moje projekty",
      },
      reset: "Reset",
    },
  };
}
