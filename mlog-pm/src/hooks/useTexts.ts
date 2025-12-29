export type Texts = {
  capacityMatrix: {
    milestoneHeader: {
      incomeLabel: string
      doneLabel: string
      overflowPrefix: string
      editButton: string
      addMonthButton: string
    }
    roles: {
      pm: string
      creative: string
      inactive: string
    }
    headers: {
      month: string
      planned: string
      value: string
      logged: string
      predictedCost: string
      predictedProfit: string
    }
  }
  projectHeader: {
    plan: string
    logged: string
    edit: string
    responsible: string
  }
  kpis: {
    totalIncome: string
    predictedCosts: string
    predictedProfit: string
  }
  pages: {
    monthlyOverview: {
      title: string
      description: string
    }
    myProjects: {
      title: string
      description: string
    }
  }
  milestoneModal: {
    title: string
    nameLabel: string
    incomeLabel: string
    doneLabel: string
    startMonthLabel: string
    startYearLabel: string
    cancel: string
    save: string
    saving: string
  }
  monthCapacityModal: {
    title: string
    plannedTotalLabel: string
    remainingLabel: string
    userPlannedLabel: string
    cancel: string
    save: string
    saving: string
    subtitle?: string
    footerNote?: string
    overflowSuffix?: string
  }
  general: {
    loading: string
    errorPrefix: string
    notFound: string
    welcome: string
    appTitle: string
    nav: {
      home: string
      project: string
      overview: string
      myProjects: string
    }
  }
}

export default function useTexts(): Texts {
  return {
    capacityMatrix: {
      milestoneHeader: {
        incomeLabel: 'Příjem',
        doneLabel: 'Hotovo',
        overflowPrefix: 'Překročeno',
        editButton: 'E',
        addMonthButton: '+m',
      },
      roles: {
        pm: 'PM',
        creative: 'Kreativec',
        inactive: 'Neaktivní',
      },
      headers: {
        month: 'Měsíc',
        planned: 'Plán (h)',
        value: 'Hodnota (Kč)',
        logged: 'Čerpáno',
        predictedCost: 'Pred. náklad',
        predictedProfit: 'Pred. zisk',
      },
    },
    projectHeader: {
      plan: 'Plán',
      logged: 'Zalogováno',
      edit: 'Editace',
      responsible: 'Odpovědný PM:',
    },
    kpis: {
      totalIncome: 'Celkový příjem',
      predictedCosts: 'Predikce nákladů',
      predictedProfit: 'Predikce zisku',
    },
    pages: {
      monthlyOverview: {
        title: 'Měsíční přehled — {month}/{year}',
        description: 'Tabulka projektů a milníků pro vybraný měsíc se zobrazí zde.',
      },
      myProjects: {
        title: 'Moje projekty — uživatel {userId}',
        description: 'Osobní přehled projektů se zobrazí zde.',
      },
    },
    milestoneModal: {
      title: 'Upravit milník',
      nameLabel: 'Název',
      incomeLabel: 'Příjem',
      doneLabel: 'Hotovo %',
      startMonthLabel: 'Počáteční měsíc',
      startYearLabel: 'Počáteční rok',
      cancel: 'Zrušit',
      save: 'Uložit',
      saving: 'Ukládám...',
    },
    monthCapacityModal: {
      title: 'Editace kapacity',
      plannedTotalLabel: 'Plánovaná kapacita (h)',
      remainingLabel: 'Zbývá (h)',
      userPlannedLabel: 'Plán (h)',
      cancel: 'Zrušit',
      save: 'Uložit změny',
      saving: 'Ukládám...',
      subtitle: 'Nastavení plánované kapacity a rozdělení mezi pracovníky',
      footerNote: 'Změny se projeví po uložení',
      overflowSuffix: '(překročeno)',
    },
    general: {
      loading: 'Načítám projekt...',
      errorPrefix: 'Chyba:',
      notFound: 'Projekt nenalezen',
      welcome: 'Vítejte — zde můžete začít pracovat na projektu.',
      appTitle: 'mlog-pm',
      nav: {
        home: 'Domů',
        project: 'Projekt',
        overview: 'Měsíční přehled',
        myProjects: 'Moje projekty',
      },
    },
  }
}
