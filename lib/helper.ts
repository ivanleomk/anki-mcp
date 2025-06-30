export const getStatus = (card: any): string => {
  switch (card.queue) {
    case -1:
      return "suspended";
    case 0:
      return "new";
    case 1:
      return "learning";
    case 2:
      return "review";
    default:
      return "unknown";
  }
};


