/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import * as $protobuf from "protobufjs/light";

const $root = ($protobuf.roots["default"] || ($protobuf.roots["default"] = new $protobuf.Root()))
.addJSON({
  pb: {
    nested: {
      Command: {
        fields: {
          commandName: {
            type: "string",
            id: 1
          },
          content: {
            keyType: "string",
            type: "string",
            id: 2
          }
        }
      },
      Frame: {
        fields: {
          magic: {
            rule: "required",
            type: "int32",
            id: 1
          },
          id: {
            rule: "required",
            type: "string",
            id: 2
          },
          type: {
            rule: "required",
            type: "Type",
            id: 3
          },
          serviceName: {
            type: "string",
            id: 4
          },
          methodName: {
            type: "string",
            id: 5
          },
          paramJson: {
            type: "string",
            id: 6
          },
          success: {
            type: "bool",
            id: 7
          },
          code: {
            type: "int32",
            id: 8
          },
          msg: {
            type: "string",
            id: 9
          },
          resultJson: {
            type: "string",
            id: 10
          },
          commandName: {
            type: "string",
            id: 11
          },
          contentJson: {
            type: "string",
            id: 12
          }
        },
        nested: {
          Type: {
            values: {
              REQUEST: 1,
              RESPONSE: 2,
              COMMAND: 3
            }
          }
        }
      },
      Payload: {
        fields: {
          success: {
            rule: "required",
            type: "bool",
            id: 1
          },
          code: {
            rule: "required",
            type: "int32",
            id: 2
          },
          msg: {
            rule: "required",
            type: "string",
            id: 3
          },
          result: {
            keyType: "string",
            type: "string",
            id: 4
          }
        }
      },
      Request: {
        fields: {
          serviceName: {
            rule: "required",
            type: "string",
            id: 1
          },
          methodName: {
            type: "string",
            id: 2
          },
          params: {
            keyType: "string",
            type: "string",
            id: 3
          }
        }
      }
    }
  }
});

export { $root as default };
