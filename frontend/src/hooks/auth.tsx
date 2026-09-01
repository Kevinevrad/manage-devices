/**
 * Contexte d'authentification : utilisateur courant + actions
 * inscription / connexion / déconnexion. La session est restaurée
 * au démarrage depuis le JWT persisté dans localStorage.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";

import { api, definirJetton, obtenirJetton, supprimerJetton } from "@/lib/api";
import type { DonneesInscription, UtilisateurApi } from "@/types/api";

interface ContexteAuth {
  /** Utilisateur connecté (null si visiteur). */
  utilisateur: UtilisateurApi | null;
  /** True pendant la restauration de session au démarrage. */
  restauration: boolean;
  connecter: (email: string, motDePasse: string) => Promise<void>;
  inscrire: (donnees: DonneesInscription) => Promise<void>;
  deconnecter: () => void;
}

const Contexte = createContext<ContexteAuth | null>(null);

export function FournisseurAuth({ children }: { children: ReactNode }) {
  const [utilisateur, setUtilisateur] = useState<UtilisateurApi | null>(null);
  const [restauration, setRestauration] = useState<boolean>(
    () => obtenirJetton() !== null,
  );

  useEffect(() => {
    // Restaure la session depuis le jeton persisté (au démarrage uniquement)
    if (obtenirJetton() === null) return;
    api.auth
      .moi()
      .then(setUtilisateur)
      .catch(() => supprimerJetton())
      .finally(() => setRestauration(false));
  }, []);

  const connecter = useCallback(async (email: string, motDePasse: string) => {
    const reponse = await api.auth.connecter({ email, motDePasse });
    definirJetton(reponse.jetton);
    setUtilisateur(reponse.utilisateur);
  }, []);

  const inscrire = useCallback(async (donnees: DonneesInscription) => {
    const reponse = await api.auth.inscrire(donnees);
    definirJetton(reponse.jetton);
    setUtilisateur(reponse.utilisateur);
  }, []);

  const deconnecter = useCallback(() => {
    supprimerJetton();
    setUtilisateur(null);
  }, []);

  const valeur = useMemo<ContexteAuth>(
    () => ({ utilisateur, restauration, connecter, inscrire, deconnecter }),
    [utilisateur, restauration, connecter, inscrire, deconnecter],
  );

  return <Contexte.Provider value={valeur}>{children}</Contexte.Provider>;
}

/** Accès à l'utilisateur connecté et aux actions d'authentification. */
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): ContexteAuth {
  const contexte = useContext(Contexte);
  if (contexte === null) {
    throw new Error("useAuth doit être utilisé dans <FournisseurAuth>.");
  }
  return contexte;
}
