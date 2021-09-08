export const Errors = {
    NOT_A_MODULE: 'not_a_module',
    IS_A_MODULE: 'is_a_module',
    NO_MODULE_FOUND: 'no_module_found',
    NO_SCENE: 'no_scene',
    NO_ROOM: 'no_room',
    NO_PLACE_FOR_ITEM: 'no_place_for_item',
    CORNER_FULL: 'corner_full',
    NO_PLACE_IN_CORNER: 'no_place_in_corner',
    ITEM_NON_COMPATIBLE: 'item_non_compatible',
    TOO_MANY_DOORS: 'too_many_doors',
    TOO_MANY_DRAWERS: 'too_many_drawers',
    TOO_MANY_LIGHTS: 'too_many_lights',
    BAD_DOOR_FOR_DRAWER: 'bad_door_for_drawer',
    BAD_DRAWER_FOR_DOOR: 'bad_drawer_for_door',
}

/* export const sendError = (error) => {

    switch (createMeubleResult) {
        case Errors.NOT_A_MODULE:
            return goingToKino(KinoEvent.SEND_MESSAGE, Errors.NOT_A_MODULE, `${sku} n'est pas un module`)
        case Errors.NO_ROOM:
            return goingToKino(KinoEvent.SEND_MESSAGE, Errors.NO_ROOM, `Il n'y a pas assez de place pour ce meuble`)
        case Errors.CORNER_FULL:
            return goingToKino(KinoEvent.SEND_MESSAGE, Errors.CORNER_FULL, `Ce coin est déjà occupé`)
        case Errors.NO_PLACE_IN_CORNER:
            return goingToKino(KinoEvent.SEND_MESSAGE, Errors.NO_PLACE_IN_CORNER, `Il n'y a pas assez de place dans le coin pour ce meuble`)
        default:
            console.warn(`error ${createMeubleResult} not handled`)
    }
} */