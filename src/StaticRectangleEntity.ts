import { Scene } from "@babylonjs/core/scene";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";

export default class StaticRectangleEntity {
    private _x: number;
    private _z: number;
    id: string;
    private _width: number;
    private _height: number;

    private _currentScene: Scene;

    private _staticRectangleBody?: Mesh;
    private _staticRectangleMaterial?: StandardMaterial;

    constructor(serverStaticRectangleEntity: any, scene: Scene) {
        this._x = serverStaticRectangleEntity.x;
        this._z = serverStaticRectangleEntity.z;
        this.id = serverStaticRectangleEntity.id;
        this._width = serverStaticRectangleEntity.collisionBody.width;
        this._height = serverStaticRectangleEntity.collisionBody.height;
        this._currentScene = scene;
    }

    drawEntity() {
        this._staticRectangleBody = MeshBuilder.CreateBox(
            "staticBody",
            {
                width: this._width,
                height: 0.1,
                depth: this._height,
            },
            this._currentScene
        );
        this._staticRectangleMaterial = new StandardMaterial(
            "staticMaterial",
            this._currentScene
        );
        this._staticRectangleBody.material = this._staticRectangleMaterial;
        this._staticRectangleMaterial.diffuseColor =
            Color3.FromHexString("#FFFF00");

        this._staticRectangleBody.position.x = this._x;
        this._staticRectangleBody.position.z = this._z;
    }

    deleteMeshes() {
        if (typeof this._staticRectangleBody !== "undefined") {
            this._staticRectangleBody.dispose();
        }
    }
}
