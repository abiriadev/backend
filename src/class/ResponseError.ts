interface ResponseErrorProperties {
    status: number
    action?: string
    errorName?: string
    message: string
}

export default class extends Error implements ResponseErrorProperties {
    readonly status: number
    readonly message: string
    readonly action?: string
    readonly errorName?: string

    constructor(_: ResponseErrorProperties) {
        super()

        Object.assign(this, _)
    }
}
