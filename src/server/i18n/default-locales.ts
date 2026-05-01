/* eslint-disable camelcase */

import type { AbstractIntlMessages } from 'next-intl';

export const defaultLocales: AbstractIntlMessages = {
    home_page: {
        header: {
            title: 'Sur quel <child1>thème</child1> sera votre vidéo ?',
        },
    },
    new_theme_page: {
        header: {
            title: 'Créer votre <child1>thème</child1> :',
        },
        name_field: {
            label: 'Nom du thème<child1>*</child1>:',
            placeholder: 'Nouveau thème',
        },
        common: {
            add_theme: 'Ajouter votre thème',
        },
    },
    '1_scenario_page': {
        header: {
            title: 'Quel <child1>scénario</child1> choisir ?',
        },
        secondary: {
            title: "C'est à votre tour, sélectionnez un scénario à filmer",
        },
        new_scenario_card: {
            name: 'Nouveau scénario',
            desc: 'Cliquez ici pour créer votre propre scénario !',
        },
        scenario_card: {
            step_count: '{count, plural, one {{count} étape} other {{count} étapes}}',
        },
    },
    '1_new_scenario_page': {
        header: {
            title: 'Crée ton nouveau <child1>scénario</child1> !',
        },
        title_field: {
            label: 'Choisis ton titre<child1>*</child1> :',
            placeholder: 'Mon scénario',
        },
        desc_field: {
            label: 'Fais en une rapide description :',
            placeholder: 'Ma description',
        },
    },
    '2_questions_page': {
        header: {
            title: 'Mes <child1>séquences</child1>',
        },
        secondary: {
            title: 'Pour structurer votre scénario, nous vous proposons de le découper en séquences. Souvent une séquence correspond à une idée.',
        },
        delete_sequence_modal: {
            title: 'Supprimer la séquence ?',
            desc: 'Voulez-vous vraiment supprimer la séquence :',
        },
        add_question_button: {
            label: 'Ajouter une séquence',
        },
        save_project_modal: {
            title: 'Sauvegarder le projet ?',
            desc: `Enregistrer le projet vous permettra de le retrouver dans l'onglet "Mes vidéos" et également dans l'application Par Le Monde.`,
            cancel: 'Ne pas sauvegarder',
            confirm: 'Sauvegarder le projet',
        },
        save_project_name_field: {
            label: 'Nom du projet :',
        },
    },
    '2_new_questions_page': {
        question_field: {
            label: 'Ajoute une séquence :',
            placeholder: 'Ma séquence',
        },
    },
    '2_edit_questions_page': {
        question_field: {
            label: 'Modifier une séquence :',
            placeholder: 'Ma séquence',
        },
    },
    '3_storyboard_page': {
        header: {
            title: 'Création du <child1>Storyboard</child1>',
        },
        secondary: {
            title: "Ici créez votre storyboard ! C'est une représentation de votre film sous forme de dessins et le résultat final de votre vidéo sera l'assemblage de ces plans les uns après les autres.\n",
        },
        pdf_button: {
            label: 'Télécharger le storyboard',
        },
        collaboration: {
            send_for_validation: 'Envoyer pour vérification',
            awaiting_validation: 'En attente de validation du storyboard',
        },
        button: {
            add_plan: 'Ajouter un plan',
        },
        delete_plan_modal: {
            title: 'Supprimer le plan ?',
            desc: 'Voulez-vous vraiment supprimer le plan n° {planNumber} ?',
        },
        delete_title_modal: {
            title: 'Supprimer le titre ?',
            desc: 'Voulez-vous vraiment supprimer le titre ?',
        },
    },
    '3_edit_storyboard_page': {
        header: {
            title: 'Créez votre plan',
        },
        secondary: {
            question_name: 'Séquence : {sequenceName}',
            plan_number: 'Plan numéro : {planNumber}',
        },
        edit_description: {
            label: 'Description du plan :',
            placeholder:
                'Ici, vous pouvez décrire comment vous allez filmer ce plan.\n' +
                'Par exemple :\n' +
                '\tQUI ? quels élèves sont impliqués dans le tournage de ce plan ?\n' +
                "\tCOMMENT ? Comment sont répartis les rôles entre élèves ? (qui tient la caméra, qui surveille le cadre, qui apparaît à l'écran ?)\n" +
                '\tQUOI ? Que vont faire ou dire vos élèves ?\n' +
                '\tQUAND ? À quelle date vous allez filmer ce plan ?\n' +
                '\tOÙ ? Dans quel lieu allez-vous tourner ce plan ?',
        },
        edit_image: {
            label: 'Dessin du plan :',
            desktop_desc: "Pour créer votre plan vous pouvez soit l'importer, soit le prendre en photo ou le dessiner en ligne !",
            mobile_desc: "Pour créer votre plan vous pouvez l'importer ou le prendre en photo !",
        },
        update_image_button: {
            label: 'Changer le dessin',
        },
        update_image_modal: {
            title: 'Changer le dessin du plan',
        },
        take_picture_modal: {
            title: 'Prendre une photo',
        },
        draw_plan_modal: {
            title: 'Dessiner le plan',
        },
        upload_image_button: {
            label: 'Importer une image',
        },
        take_picture_button: {
            label: 'Prendre une photo',
        },
        draw_plan_button: {
            label: 'Dessiner le plan',
        },
    },
    cropper: {
        resize_image_modal: {
            title: "Redimensionner l'image",
        },
    },
    canvas: {
        color_tool: {
            label: 'Couleur',
        },
        size_tool: {
            label: 'Épaisseur',
        },
        undo: {
            label: 'Revenir en arrière',
        },
        redo: {
            label: 'Revenir en avant',
        },
        clear: {
            label: 'Tout effacer',
        },
        clear_modal: {
            title: 'Effacer le canvas',
            desc: 'Êtes-vous sûr de vouloir effacer totalement le canvas ?',
        },
        color_modal: {
            title: 'Choisissez la couleur du trait',
        },
        size_modal: {
            title: "Choisissez l'épaisseur du trait",
        },
    },
    '3_title_storyboard_page': {
        add_title_card: {
            label: 'Ajouter un titre',
        },
        header: {
            title: 'Création du titre de la séquence n° {planNumber}',
        },
        secondary: {
            title: "Pour chaque séquence, vous pouvez choisir d'ajouter un titre. Par défaut, il s'agit du titre de la séquence, mais vous pouvez le modifier !",
        },
        title_form_size: {
            small: 'petit',
            medium: 'moyen',
            big: 'grand',
        },
        title_form_alignment: {
            left: 'gauche',
            center: 'centré',
            right: 'droite',
            justify: 'justifié',
        },
        title_form_color: {
            white: 'blanc',
            black: 'noir',
            red: 'rouge',
            blue: 'bleu',
            green: 'vert',
        },
    },
    '3_generating_pdf_page': {
        title: 'Génération du PDF...',
    },
    '4_pre_mounting_page': {
        header: {
            title: 'Prémontez votre <child1>film</child1>',
        },
        secondary: {
            title: 'Pour chaque séquence vous pouvez écrire et enregistrer une voix-off.',
        },
        not_edited: {
            placeholder: 'Vous devez éditer au moins un plan pour monter cette séquence.',
        },
        collaboration: {
            send_for_validation: 'Envoyer pour vérification',
            awaiting_validation: 'En attente de validation du prémontage',
        },
    },
    '4_edit_pre_mounting_page': {
        header: {
            title: 'Écrire, ajouter une voix-off et ajuster la séquence n°{number}',
        },
        secondary: {
            title: 'À cette étape, vous pouvez écrire et ajouter une voix-off, modifier combien de temps apparaîssent vos plans, et la durée de votre séquence.',
        },
        voice_off_field: {
            label: "Écrivez ici le texte de la voix-off. Il s'agit du commentaire audio qui peut accompagner votre séquence.",
            placeholder:
                'Vous pourrez enregistrer un élève ou plusieurs élèves lire cette voix-off avec un microphone, comme celui de votre smartphone.\n' +
                'Pensez à enregistrer cette voix-off dans un environnement sonore calme.\n' +
                'Si vous utilisez votre smartphone, pensez à le mettre en mode avion.\n' +
                'Rendez-vous en bas de cette page pour ajouter votre fichier son à la séquence. ',
        },
        duration_field: {
            label: 'Ajustez ici la durée totale de la séquence, ainsi que la durée relative des plans.',
        },
        audio_field: {
            label:
                'Mettez en ligne la voix-off que vous avez enregistrée.\n' +
                " Vous pourrez ensuite l'ajuster à la séquence et régler son volume, dans la table de montage ci-dessus.",
        },
        audio_import_button: {
            label: 'Importer un son',
            formats: 'Formats acceptés : .acc, .ogg, .opus, .mp3, .wav',
        },
    },
    '5_music_page': {
        header: {
            title: 'Ajouter une musique en fond sonore',
        },
        secondary: {
            title: 'À cette étape,  vous pouvez pré-visualiser votre diaporama sonore et y ajouter une musique. ',
        },
    },
    '6_result_page': {
        header: {
            title: 'À votre <child1>caméra</child1> !',
        },
        secondary: {
            title: 'À cette étape,  vous pouvez pré-visualiser votre diaporama sonore achevé.',
        },
        downloads_buttons: {
            title: 'Vous pouvez maintenant télécharger ce diaporama ou son fichier de montage pour y intégrer vos plans vidéos.',
        },
        download_mp4_button: {
            label: 'Télécharger votre vidéo',
            generate: 'Générer votre vidéo !',
            loading: 'Création de votre vidéo...',
            user_disabled: 'Connectez-vous et créez un projet pour générer une vidéo.',
            project_disabled: 'Créez un projet pour générer une vidéo.',
        },
        download_browser_video_button: {
            generate: 'Générer dans le navigateur (bêta)',
            download: 'Télécharger la vidéo générée',
            modal_title: 'Création de votre vidéo',
            keep_page_open: 'Veuillez garder cette page ouverte jusqu’à la fin de la génération.',
            checking_support: 'Vérification de la compatibilité du navigateur...',
            'checking-support': 'Vérification de la compatibilité du navigateur...',
            'loading-assets': 'Chargement des médias...',
            rendering: 'Création des images de la vidéo...',
            finalizing: 'Finalisation de la vidéo...',
            failed: 'Impossible de générer la vidéo dans ce navigateur.',
            too_long: 'Cette vidéo est trop longue pour une génération dans le navigateur. Durée maximale approximative : {maxDuration}.',
            'missing-webcodecs': 'Votre navigateur ne prend pas en charge la génération vidéo locale.',
            'missing-codecs': 'Votre navigateur ne prend pas en charge les codecs nécessaires à la génération vidéo locale.',
        },
        download_mlt_button: {
            label: 'Télécharger le fichier de montage',
        },
    },
    common: {
        navigation: {
            create: 'Créer',
            my_videos: 'Mes vidéos',
            inspiration: 'Inspiration',
            settings: 'Réglages',
            login: 'Je me connecte !',
            app: 'Application',
            admin: 'Admin',
            my_account: 'Mon compte',
        },
        actions: {
            edit: 'Modifier',
            cancel: 'Annuler',
            next: 'Suivant',
            back: 'Retour',
            continue: 'Continuer',
            save: 'Enregistrer',
            delete: 'Supprimer',
            validate: 'Valider',
            or: 'ou',
        },
        filters: {
            all_themes: 'Tout les thèmes',
        },
        errors: {
            unknown: 'Une erreur est survenue...',
            upload_sound: "Une erreur est survenue lors de l'importation du son.",
            upload_image: "Une erreur est survenue lors de l'importation de l'image.",
            sso_connection_failed: 'Impossible de se connecter avec prof.ParLeMonde.org',
            account_blocked: 'Compte bloqué. Veuillez réinitialiser le mot de passe.',
            sso_connection_required: 'Veuillez utiliser la connection avec prof.ParLeMonde.org pour vous connecter.',
            invalid_credentials: 'Identifiants invalides.',
            invalid_invite_code: "Code d'invitation invalide.",
        },
        steps: {
            step1: 'Choix du scénario',
            step2: 'Choix des séquences',
            step3: 'Storyboard',
            step4: 'Prémontage',
            step5: 'Musique',
            step6: 'Téléchargements',
        },
    },
    join_page: {
        header: {
            title: 'Rejoindre une session collaborative',
        },
        project_code_field: {
            label: 'Code de collaboration',
        },
        submit_button: {
            label: 'Rejoindre',
        },
        back_to_login_link: {
            label: 'Retour à la page de connexion',
        },
        question_choice: {
            title: 'Sélectionnez votre séquence :',
            sequence_number: 'Séquence n°{number}',
        },
        errors: {
            invalid_code: 'Code de collaboration invalide',
        },
    },
    login_page: {
        header: {
            title: 'Connexion à votre compte classe',
        },
        email_field: {
            label: 'E-mail du professeur',
        },
        password_field: {
            label: 'Mot de passe',
        },
        connect_button: {
            label: 'Se connecter',
        },
        forgot_password_link: {
            label: 'Mot de passe oublié ?',
        },
        student_button: {
            label: 'Je suis un·e élève',
        },
        sso_button: {
            label: 'Se connecter avec prof.parlemonde.org',
        },
        no_account: {
            text: 'Nouveau sur Par Le Monde ?',
            link: "S'inscrire",
        },
    },
    my_account_page: {
        header: {
            title: 'Mon compte',
        },
        connection_subheader: {
            title: 'Mes identifiants',
        },
        name_field: {
            label: 'Nom du professeur',
            error: 'Nom invalide',
        },
        email_field: {
            label: 'E-mail du professeur',
            error: 'E-mail invalide',
        },
        logout_button: {
            title: 'Se déconnecter',
            label: 'Se déconnecter',
        },
        delete_account_button: {
            title: 'Supprimer mon compte',
            label: 'Supprimer mon compte',
        },
        change_name_button: {
            label: 'Changer mon nom',
        },
        change_email_button: {
            label: 'Changer mon e-mail',
        },
        change_password_button: {
            label: 'Changer mon mot de passe',
        },
        change_name_modal: {
            title: 'Changer mon nom',
        },
        change_email_modal: {
            title: 'Changer mon e-mail',
            info: 'Votre email est votre identifiant de connection.',
        },
        change_password_modal: {
            title: 'Changer mon mot de passe',
        },
        current_password_field: {
            label: 'Mot de passe actuel',
        },
        new_password_field: {
            label: 'Nouveau mot de passe',
            error: 'Mot de passe trop faible. Il doit contenir au moins 8 charactères avec des lettres minuscules, majuscules et des chiffres.',
        },
        new_password_confirm_field: {
            label: 'Confirmer le nouveau mot de passe',
            error: 'Mots de passe différents',
        },
        delete_account_modal: {
            title: 'Supprimer mon compte',
            warning1: 'Attention! Êtes-vous sur de vouloir supprimer votre compte ? Cette action est <child0>irréversible</child0>.',
            warning2: "Pour supprimer votre compte, veuillez taper '<child0>{deleteConfirm}</child0>' ci-dessous et cliquez sur supprimer.",
            delete_confirm: 'supprimer',
            placeholder: 'Tapez {deleteConfirm} ici',
        },
    },
    my_videos_page: {
        header: {
            title: 'Mes <child1>super</child1> vidéos',
        },
        project_card: {
            theme_name: 'Thème : {themeName}',
        },
        empty_list: {
            title: "Vous n'avez pas encore de projet en cours. En créer un ?",
        },
    },
    video_page: {
        header: {
            title: 'Projet :',
            subtitle: 'Détails du projets',
        },
        name_field: {
            label: 'Nom du projet :',
        },
        theme_field: {
            label: 'Thème :',
        },
        scenario_field: {
            label: 'Scénario :',
        },
        question_number_field: {
            label: 'Nombre de séquences :',
        },
        plan_number_field: {
            label: 'Nombre de plans :',
        },
        see_plans_button: {
            label: 'Voir les plans',
        },
        update_name_button: {
            label: 'Changer',
        },
        edit_name_modal: {
            title: 'Modifier le nom du projet',
        },
        edit_name_field: {
            label: 'Nom du projet',
            placeholder: 'Mon projet',
        },
        delete_button: {
            label: 'Supprimer le projet',
        },
        delete_modal: {
            title: 'Supprimer le projet ?',
            desc1: 'Voulez-vous vraiment supprimer le projet <strong>{projetName}</strong> ?',
        },
        not_found: {
            text: "Cette vidéo n'existe pas !",
        },
        not_found_button: {
            label: "Retour à la page d'accueil",
        },
    },
    reset_password_page: {
        header: {
            title: 'Réinitialiser le mot de passe',
        },
        email_field: {
            label: 'E-mail',
        },
        submit_button: {
            label: 'Réinitialiser',
        },
        login_link: {
            label: 'Retour à la page de connexion',
        },
        toast_message: {
            reset_success: 'Un lien pour réinitialiser le mot de passe de votre compte a été envoyé avec succès à votre addresse e-mail !',
        },
    },
    settings_page: {
        header: {
            title: 'Réglages',
        },
        language_header: {
            title: "Changer la langue de l'application :",
        },
        language_field: {
            label: 'Langue',
        },
    },
    signup_page: {
        header: {
            title: 'Création du compte classe',
        },
        name_field: {
            label: 'Nom du professeur',
        },
        email_field: {
            label: 'E-mail du professeur',
            error: 'E-mail invalide.',
        },
        password_field: {
            label: 'Mot de passe',
            error: 'Mot de passe trop faible. Il doit contenir au moins 8 charactères avec des lettres minuscules, majuscules et des chiffres.',
        },
        password_confirm_field: {
            label: 'Confirmer le mot de passe',
            error: 'Mots de passe différents.',
        },
        submit_button: {
            label: "S'inscrire !",
        },
        login_link: {
            already: 'Compte déjà créé ?',
            label: 'Se connecter',
        },
        invite_code_field: {
            title: "Créez votre compte classe avec votre code d'invitation :",
            label: "Saisir votre code d'invitation",
            error: "Code d'invitation invalide...",
        },
        continue_button: {
            label: 'Continuer',
        },
    },
    update_password_page: {
        header: {
            title: 'Réinitialiser le mot de passe',
        },
        password_field: {
            label: 'Nouveau mot de passe',
            error: 'Mot de passe trop faible. Il doit contenir au moins 8 charactères avec des lettres minuscules, majuscules et des chiffres.',
        },
        password_confirm_field: {
            label: 'Confirmer le nouveau mot de passe',
            error: 'Mots de passe différents.',
        },
        submit_button: {
            label: 'Réinitialiser',
        },
        toast_message: {
            update_success: 'Le mot de passe de votre compte a été réinitialisé avec succès !',
        },
    },
    pdf: {
        title: 'Plan de tournage',
        subtitle_description: 'Description générale :',
        theme: 'Thème :',
        scenario: 'Scénario :',
        subtitle_storyboard: 'Storyboard :',
        subtitle_tocamera: 'À votre caméra !',
        tocamera_desc: "Flashez le code QR suivant pour accéder directement à l'application et démarrer le tournage.",
    },
    email: {
        reset_password_subject: 'Réinitialisez votre mot de passe',
        welcome2: 'Bonjour,',
        reset_password: {
            text: 'Vous pouvez réinitialiser votre mot de passe en cliquant sur le lien ci-dessous :',
            text_2: "Si vous n'avez pas demandé la réinitialisation de votre mot de passe, vous pouvez ignorer cet email.",
            button: 'RÉINITIALISER MON MOT DE PASSE',
        },
        end: 'Cordialement,',
        signature: "L'équipe Par Le Monde.",
        end_text: 'Ce message a été envoyé à',
        end_text_2: "Si vous avez des questions ou ne souhaitez plus recevoir d'emails, ",
        contact_link: 'contactez-nous',
    },
};
