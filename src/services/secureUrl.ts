import { parseSecureUrl } from '../lib/url';
import { prisma } from '../prisma';

export async function getSecureUrlFromId(id: string) {
  const secureUrl = await prisma.secureUrl.findUnique({
    where: {
      id,
    },
  });

  if (!secureUrl) {
    return false;
  }

  const parsedUrl = parseSecureUrl(secureUrl.path);

  if (!parsedUrl) {
    return false;
  }

  return { ...parsedUrl, ...secureUrl };
}
