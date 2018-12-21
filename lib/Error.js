class BaseError extends Error {
    constructor(message, status) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
        this.status = status || 500;
    }
}

class TabSpaceError extends BaseError {
    /**
     * TAB SPACE 가 4의 배수가 아닌경우
     * @param message
     */
    constructor(message) {
        super(`${message} tab space must be a multiple of 4`);
    }
}

class TabSpaceDiffError extends BaseError {
    /**
     * previous line 과 current line 의 차이가 4가 아닌경우
     * 예를들어 전 라인이 4 space 였는데 갑자기 12 space 가 된경우
     * @param message
     */
    constructor(message) {
        super(`${message} tab space must be increase 4 space at one step`);
    }
}

module.exports = {
    TabSpaceError,
    TabSpaceDiffError,
};
