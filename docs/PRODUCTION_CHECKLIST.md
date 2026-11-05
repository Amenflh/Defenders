# Checklist Go / No-Go production

## A. P0 - Bloquant

- [ ] Décider si le site doit être public sans connexion
- [ ] Révoquer tout App Password SMTP exposé
- [ ] Générer un nouveau App Password dédié
- [ ] Ajouter le domaine production et les DNS
- [ ] Configurer HTTPS et redirection HTTP vers HTTPS
- [ ] Définir les origines CORS production
- [ ] Définir les cookies Secure/HttpOnly/SameSite
- [ ] Vérifier les ports Docker et le firewall
- [ ] Ajouter les secrets production hors Git
- [ ] Configurer PostgreSQL avec un mot de passe unique
- [ ] Exécuter toutes les migrations Prisma
- [ ] Tester inscription réelle avec e-mail
- [ ] Vérifier notification administrateur
- [ ] Vérifier confirmation visiteur
- [ ] Vérifier pièce jointe PDF/JPG/PNG
- [ ] Vérifier RBAC client/admin

## B. P1 - Critique

- [ ] Sauvegarde PostgreSQL quotidienne
- [ ] Sauvegarde testée par restauration
- [ ] Sauvegarde média hors serveur principal
- [ ] Monitoring `/api/health`
- [ ] Alertes uptime
- [ ] Alertes échec SMTP
- [ ] Alertes espace disque
- [ ] Rotation des logs
- [ ] Page d'erreur serveur
- [ ] Environnement staging
- [ ] Domaine staging séparé
- [ ] Scans de dépendances
- [ ] Tests API
- [ ] Tests E2E principaux
- [ ] Tests responsive

## C. P2 - Important

- [ ] Lighthouse mobile
- [ ] Lighthouse desktop
- [ ] PageSpeed Web
- [ ] Contrôle SEO robots/sitemap/canonical
- [ ] Données structurées si nécessaire
- [ ] Mentions légales vérifiées
- [ ] Politique de confidentialité vérifiée
- [ ] Cookies tiers documentés
- [ ] Runbook incidents
- [ ] Guide de mise à jour
- [ ] Guide de sauvegarde/restauration
- [ ] Guide utilisateur administrateur
- [ ] Guide utilisateur client

## Décision

| Résultat | Décision |
|---|---|
| Tous les P0 validés | Autoriser le déploiement production |
| Un P0 échoué | Interdire le déploiement |
| Aucun P0 échoué mais P1 critique échoué | Déploiement différé ou validation explicite par la direction |
