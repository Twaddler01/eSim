export default class SaveManager {

    constructor(
        rootData,
        storageKey = 'saveState',
        autoSaveInterval = 5000
    ) {
        this.rootData = rootData;
        this.storageKey = storageKey;
        this.intervalId = null;

        this.defaultData =
            structuredClone(rootData);

        this.load();

        this.startAutoSave(autoSaveInterval);

        window.addEventListener(
            'beforeunload',
            () => this.save()
        );
    }

    // ==========================================
    // SAVE
    // ==========================================

    save() {
        try {
            const saveData = {
                messageData:
                    structuredClone(
                        this.rootData.messageData
                    ),

                elapsedTime:
                    this.rootData.elapsedTime,

                currentStage:
                    structuredClone(
                        this.rootData.currentStage
                    ),

                stageProgress:
                    structuredClone(
                        this.rootData.stageProgress
                    )
            };

            localStorage.setItem(
                this.storageKey,
                JSON.stringify(saveData)
            );

        } catch (e) {
            console.warn(
                '[SaveManager] Failed to save state:',
                e
            );
        }
    }

    // ==========================================
    // LOAD
    // ==========================================

    load() {

        const savedJson =
            localStorage.getItem(this.storageKey);

        if (!savedJson) {
            return false;
        }

        try {

            const savedData =
                JSON.parse(savedJson);

            // Restore everything from the save
            Object.assign(
                this.rootData,
                savedData
            );

            console.log(
                '[SaveManager] Loaded saved state'
            );

            return true;

        } catch (e) {

            console.warn(
                '[SaveManager] Failed to load saved state:',
                e
            );

            return false;
        }
    }

    // ==========================================
    // AUTO SAVE
    // ==========================================

    startAutoSave(intervalMs) {

        if (this.intervalId) {
            clearInterval(this.intervalId);
        }

        this.intervalId =
            setInterval(
                () => this.save(),
                intervalMs
            );
    }

    stopAutoSave() {

        if (this.intervalId) {
            clearInterval(this.intervalId);
        }

        this.intervalId = null;
    }

    // ==========================================
    // CLEAR
    // ==========================================

    clear() {

        localStorage.removeItem(
            this.storageKey
        );

        Object.assign(
            this.rootData,
            structuredClone(
                this.defaultData
            )
        );

        console.log(
            '[SaveManager] Cleared saved state'
        );
    }

    // ==========================================
    // DEBUG
    // ==========================================

    debug() {

        const savedJson =
            localStorage.getItem(
                this.storageKey
            );

        if (!savedJson) {
            console.log(
                'No save data found.'
            );
            return;
        }

        const savedData =
            JSON.parse(savedJson);

        console.log(
            JSON.stringify(
                savedData,
                null,
                2
            )
        );
    }

    test() {
        console.log('SaveManager...');
    }
}