import { requireTabId, sendErrorResult, sendSuccessResult } from './helpers.js';
import { withDebugger } from './resource-commands.js';

interface CertificateInfo {
  issuer: string;
  subject: string;
  validFrom: string;
  validTo: string;
  protocol: string | null;
  keyExchange: string | null;
  cipher: string | null;
}

interface SecurityResult {
  securityState: string;
  certificate: CertificateInfo | null;
  mixedContent: {
    hasInsecureContent: boolean;
    ranInsecureContent: boolean;
    displayedInsecureContent: boolean;
  };
}

export const handleBrowserGetSecurityInfo = async (
  params: Record<string, unknown>,
  id: string | number,
): Promise<void> => {
  try {
    const tabId = requireTabId(params, id);
    if (tabId === null) return;

    let result: SecurityResult | null = null;

    await withDebugger(tabId, async () => {
      const securityState = await new Promise<SecurityResult>((resolve, reject) => {
        const timeout = setTimeout(() => {
          chrome.debugger.onEvent.removeListener(listener);
          resolve({
            securityState: 'unknown',
            certificate: null,
            mixedContent: {
              hasInsecureContent: false,
              ranInsecureContent: false,
              displayedInsecureContent: false,
            },
          });
        }, 3000);

        const listener = (source: chrome.debugger.Debuggee, method: string, cdpParams?: object) => {
          if (source.tabId !== tabId || method !== 'Security.visibleSecurityStateChanged') return;

          clearTimeout(timeout);
          chrome.debugger.onEvent.removeListener(listener);

          try {
            const parsed = parseSecurityState(cdpParams as Record<string, unknown> | undefined);
            resolve(parsed);
          } catch (err) {
            reject(err);
          }
        };

        chrome.debugger.onEvent.addListener(listener);

        chrome.debugger.sendCommand({ tabId }, 'Security.enable').catch(err => {
          clearTimeout(timeout);
          chrome.debugger.onEvent.removeListener(listener);
          reject(err);
        });
      });

      await chrome.debugger.sendCommand({ tabId }, 'Security.disable').catch(() => {});
      result = securityState;
    });

    sendSuccessResult(id, result);
  } catch (err) {
    sendErrorResult(id, err);
  }
};

const parseSecurityState = (params: Record<string, unknown> | undefined): SecurityResult => {
  const visibleState = params?.visibleSecurityState as Record<string, unknown> | undefined;
  if (!visibleState) {
    return {
      securityState: 'unknown',
      certificate: null,
      mixedContent: {
        hasInsecureContent: false,
        ranInsecureContent: false,
        displayedInsecureContent: false,
      },
    };
  }

  const securityState = typeof visibleState.securityState === 'string' ? visibleState.securityState : 'unknown';

  const certState = visibleState.certificateSecurityState as Record<string, unknown> | undefined;
  let certificate: CertificateInfo | null = null;

  if (certState) {
    const subjectName = typeof certState.subjectName === 'string' ? certState.subjectName : '';
    const issuer = typeof certState.issuer === 'string' ? certState.issuer : '';
    const validFrom = typeof certState.validFrom === 'number' ? new Date(certState.validFrom * 1000).toISOString() : '';
    const validTo = typeof certState.validTo === 'number' ? new Date(certState.validTo * 1000).toISOString() : '';
    const protocol = typeof certState.protocol === 'string' ? certState.protocol : null;
    const keyExchange = typeof certState.keyExchange === 'string' ? certState.keyExchange : null;
    const cipher = typeof certState.cipher === 'string' ? certState.cipher : null;

    certificate = {
      issuer,
      subject: subjectName,
      validFrom,
      validTo,
      protocol,
      keyExchange,
      cipher,
    };
  }

  return {
    securityState,
    certificate,
    mixedContent: {
      hasInsecureContent:
        securityState === 'insecure' || securityState === 'insecure-broken' || securityState === 'neutral',
      ranInsecureContent: securityState === 'insecure-broken',
      displayedInsecureContent: securityState === 'neutral',
    },
  };
};
