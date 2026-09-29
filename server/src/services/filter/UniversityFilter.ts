export class UniversityFilter {
  private static defaultDomains: string[] = [
    'srmap.edu.in',
    'srmist.edu.in',
    'university.edu',
    'edu'
  ];

  public static getAllowedDomains(): string[] {
    const envDomains = process.env.ALLOWED_UNIVERSITY_DOMAINS;
    if (envDomains) {
      return envDomains.split(',').map(d => d.trim().toLowerCase().replace(/^@/, ''));
    }
    return UniversityFilter.defaultDomains;
  }

  /**
   * Checks whether an email originates from or belongs to an authorized university domain.
   */
  public static isUniversityEmail(sender: string, recipient?: string): boolean {
    const allowed = UniversityFilter.getAllowedDomains();
    const extractDomain = (addr: string): string => {
      const match = addr.match(/@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
      return match ? match[1].toLowerCase() : '';
    };

    const senderDomain = extractDomain(sender);
    const recipientDomain = recipient ? extractDomain(recipient) : '';

    // Check sender
    const senderMatches = allowed.some(d => senderDomain === d || senderDomain.endsWith(`.${d}`));
    if (senderMatches) return true;

    // Check recipient if sender is university-adjacent
    if (recipientDomain) {
      const recipientMatches = allowed.some(d => recipientDomain === d || recipientDomain.endsWith(`.${d}`));
      // If sent to university email and looks institutional
      if (recipientMatches && (sender.includes('admin') || sender.includes('dept') || sender.includes('edu'))) {
        return true;
      }
    }

    return false;
  }

  /**
   * Returns human-readable filtering reason for non-university emails
   */
  public static getFilterReason(sender: string): string {
    const s = sender.toLowerCase();
    if (s.includes('amazon') || s.includes('flipkart') || s.includes('order')) {
      return "Commercial e-commerce delivery notification filtered out";
    }
    if (s.includes('instagram') || s.includes('facebook') || s.includes('twitter') || s.includes('linkedin')) {
      return "External social media notification filtered out";
    }
    if (s.includes('promo') || s.includes('deals') || s.includes('edutech')) {
      return "External marketing promotion filtered out";
    }
    return "Non-institutional domain filtered out by University Domain Security Policy";
  }
}
