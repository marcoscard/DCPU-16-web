import { OPCODES, SpecialOPCODES } from './opcodes'


class Emulator {
    constructor() {
        this.ramSize = 0x10000
        this.memory = []
        this.memory.length = this.ramSize
        this.registers = ["A","B","C","X","Y","Z","I","J"]
    }

    run() {
        for (var i = 0; i < Infinity; i++) {
            countCycle()
            var instruction = this.fetchInstruction()
            var decodedInstruction = this.decode(instruction)
            //CHAIN METHODS
            this.execute(decodedInstruction)
        }
    }

    fetchInstruction() {
        var pc = this.memory.pc
        var instruction = this.memory[pc++]
        return instruction
    }

    decode(binary) {
        if ((binary & 0x1f) === 0) {
            var instruction = this.getSpecialInstruction(binary)
        } else {
            var instruction = this.getInstruction(binary)
        }
        return instruction
    }

    execute(decodedBinary) {
        var a = this.get(decodedBinary.a)
        var b = this.get(decodedBinary.b)

        switch (instruction.opcode) {
            case OPCODES.SET:
                instruction.a = instruction.b
                break;

            default:
                break;
        }
    }

    countCycle(times = 1) {

    }

    getSpecialInstruction(binary) {
        return {
            opcode: (binary & 0x3ff),
            a: this.addressFor((binary >> 10) & 0x3f)
            //TODO addressfor
        }
    }

    getInstruction(binary) {
        return {
            opcode: (binary & 0x1f),
            a: this.addressFor((binary >> 10) & 0x3f),
            b: this.addressFor((binary >> 5) & 0x1f)
            // TODO addressfor
        }
    }

    addressFor(value) {
        var register, address
        if( value <= 0x7){
            register = this.registers[value]
        }
        else if ( value <= 0x0f){
            address = this.memory[value % 0x08]
        }
        else if ( value <= 0x17){
            var nextInstruction = this.memory[this.memory.pc++]
            address = (nextInstruction + this.memory[register])
        }
        else if ( value === 0x18) {

        }
        
    }


}

function main() {
    emulator = new Emulator()
    emulator.run()
}